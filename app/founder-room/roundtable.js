"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import { callStructuredModel } from "../../lib/ai/gateway";

const SPECIALISTS = [
  "sourcing",
  "product_rd",
  "market_growth",
  "regulatory_quality",
  "operations",
  "finance",
];

const CROSS_PAIRS = [
  ["sourcing", "finance"],
  ["product_rd", "regulatory_quality"],
  ["market_growth", "operations"],
];

const reviewSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    stance: { type: "string", enum: ["support", "concern", "oppose", "needs_data"] },
    summary: { type: "string" },
    facts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          claim: { type: "string" },
          evidence_status: { type: "string", enum: ["verified", "source_claim", "inference", "unknown"] },
          evidence: { type: "string" },
        },
        required: ["claim", "evidence_status", "evidence"],
      },
    },
    assumptions: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    questions: { type: "array", items: { type: "string" } },
    recommendation: { type: "string" },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
  },
  required: ["stance", "summary", "facts", "assumptions", "risks", "questions", "recommendation", "confidence"],
};

const crossCheckSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    challenge_a: {
      type: "object",
      additionalProperties: false,
      properties: {
        challenge: { type: "string" },
        why_material: { type: "string" },
        falsification_test: { type: "string" },
      },
      required: ["challenge", "why_material", "falsification_test"],
    },
    challenge_b: {
      type: "object",
      additionalProperties: false,
      properties: {
        challenge: { type: "string" },
        why_material: { type: "string" },
        falsification_test: { type: "string" },
      },
      required: ["challenge", "why_material", "falsification_test"],
    },
  },
  required: ["challenge_a", "challenge_b"],
};

const redTeamSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    strongest_counterargument: { type: "string" },
    hidden_assumptions: { type: "array", items: { type: "string" } },
    failure_modes: { type: "array", items: { type: "string" } },
    falsification_tests: { type: "array", items: { type: "string" } },
    missing_evidence: { type: "array", items: { type: "string" } },
    severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
    recommendation: { type: "string" },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
  },
  required: [
    "strongest_counterargument",
    "hidden_assumptions",
    "failure_modes",
    "falsification_tests",
    "missing_evidence",
    "severity",
    "recommendation",
    "confidence",
  ],
};

const synthesisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    executive_summary: { type: "string" },
    verified_facts: { type: "array", items: { type: "string" } },
    agreements: { type: "array", items: { type: "string" } },
    disagreements: { type: "array", items: { type: "string" } },
    unknowns: { type: "array", items: { type: "string" } },
    proposed_actions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          action: { type: "string" },
          owner: { type: "string" },
          priority: { type: "string", enum: ["urgent", "high", "medium", "low"] },
          evidence_needed: { type: "string" },
        },
        required: ["action", "owner", "priority", "evidence_needed"],
      },
    },
    recommendation: { type: "string", enum: ["go", "hold", "kill", "more_data"] },
    rationale: { type: "string" },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
  },
  required: [
    "executive_summary",
    "verified_facts",
    "agreements",
    "disagreements",
    "unknowns",
    "proposed_actions",
    "recommendation",
    "rationale",
    "confidence",
  ],
};

function safeJson(value) {
  return JSON.stringify(value ?? null, null, 2);
}

async function getAdminContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("authentication_required");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("role,active")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!admin?.active) throw new Error("admin_required");

  return { supabase, user, admin };
}

async function getSettings(supabase) {
  const { data } = await supabase
    .from("company_settings")
    .select("key,value")
    .in("key", [
      "ai.enabled",
      "founder_room.mode",
      "founder_room.model.specialist",
      "founder_room.model.red_team",
      "founder_room.model.synthesis",
      "founder_room.max_calls",
      "founder_room.max_estimated_cost_usd",
    ]);

  return Object.fromEntries((data || []).map((row) => [row.key, row.value]));
}

async function getPromptMap(supabase, codes) {
  const { data } = await supabase
    .from("agent_prompts")
    .select("agent_code,system_prompt,instructions,version")
    .in("agent_code", codes)
    .eq("active", true)
    .order("version", { ascending: false });

  const map = {};
  for (const row of data || []) {
    if (!map[row.agent_code]) map[row.agent_code] = row;
  }
  return map;
}

function opportunityContext(opportunity) {
  return {
    title: opportunity.title,
    category: opportunity.category,
    origin: opportunity.origin,
    summary: opportunity.summary,
    target_customer: opportunity.target_customer,
    target_channel: opportunity.target_channel,
    stage: opportunity.stage,
    status: opportunity.status,
  };
}

function compactReview(review) {
  return {
    agent_code: review.agent_code,
    stance: review.output.stance,
    summary: review.output.summary,
    assumptions: review.output.assumptions,
    risks: review.output.risks,
    questions: review.output.questions,
    recommendation: review.output.recommendation,
    confidence: review.output.confidence,
  };
}

export async function runFounderRoundtable(formData) {
  const { supabase, user } = await getAdminContext();

  const opportunityId = String(formData.get("opportunity_id") || "");
  if (!opportunityId) return;

  const settings = await getSettings(supabase);
  if (settings["ai.enabled"] !== true) {
    throw new Error("AI runtime is disabled. Founder approval is required before paid model execution.");
  }

  const specialistModel = String(settings["founder_room.model.specialist"] || "google/gemini-3.6-flash");
  const redTeamModel = String(settings["founder_room.model.red_team"] || "openai/gpt-5.6-sol");
  const synthesisModel = String(settings["founder_room.model.synthesis"] || "openai/gpt-5.6-sol");
  const maxCalls = Number(settings["founder_room.max_calls"] || 11);
  const maxCost = Number(settings["founder_room.max_estimated_cost_usd"] || 2);

  const [{ data: opportunity }, { data: room }] = await Promise.all([
    supabase.from("opportunities").select("*").eq("id", opportunityId).single(),
    supabase.from("agent_rooms").select("id").eq("code", "founder-room").single(),
  ]);

  if (!opportunity || !room) throw new Error("roundtable_context_missing");

  const promptMap = await getPromptMap(supabase, [
    ...SPECIALISTS,
    "challenger",
    "chief_staff",
  ]);

  const { data: run, error: runError } = await supabase
    .from("founder_room_runs")
    .insert({
      room_id: room.id,
      opportunity_id: opportunity.id,
      mode: String(settings["founder_room.mode"] || "standard"),
      status: "running",
      specialist_model: specialistModel,
      red_team_model: redTeamModel,
      synthesis_model: synthesisModel,
      max_calls: maxCalls,
      started_by: user.id,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (runError || !run) throw new Error("roundtable_run_create_failed");

  let callsUsed = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let estimatedCostUsd = 0;

  function absorbUsage(result) {
    callsUsed += 1;
    inputTokens += result.inputTokens || 0;
    outputTokens += result.outputTokens || 0;
    estimatedCostUsd += result.estimatedCostUsd || 0;

    if (callsUsed > maxCalls) {
      throw new Error("roundtable_call_budget_exceeded");
    }
    if (estimatedCostUsd > maxCost) {
      throw new Error("roundtable_cost_guard_exceeded");
    }
  }

  try {
    const context = opportunityContext(opportunity);

    const independentResults = await Promise.all(
      SPECIALISTS.map(async (agentCode) => {
        const prompt = promptMap[agentCode];
        if (!prompt) throw new Error(`missing_prompt_${agentCode}`);

        const result = await callStructuredModel({
          model: specialistModel,
          schemaName: `${agentCode}_review`,
          schema: reviewSchema,
          system: `${prompt.system_prompt}\n\n${prompt.instructions || ""}\n\nYou are in Round 1: independent review. Do not copy or assume consensus from other agents.`,
          prompt: `Review this BIOTRIX opportunity independently. Separate facts from assumptions.\n\nOPPORTUNITY:\n${safeJson(context)}`,
        });

        return { agent_code: agentCode, result, output: result.object };
      })
    );

    for (const review of independentResults) {
      absorbUsage(review.result);

      await supabase.from("founder_room_turns").insert({
        run_id: run.id,
        round_no: 1,
        turn_type: "independent_review",
        agent_code: review.agent_code,
        model_name: review.result.model,
        content: review.output.summary,
        structured_output: review.output,
        input_tokens: review.result.inputTokens,
        output_tokens: review.result.outputTokens,
        estimated_cost_usd: review.result.estimatedCostUsd,
      });

      await supabase.from("opportunity_reviews").insert({
        opportunity_id: opportunity.id,
        agent_code: review.agent_code,
        stance: review.output.stance,
        summary: review.output.summary,
        facts: review.output.facts,
        assumptions: review.output.assumptions,
        risks: review.output.risks,
        questions: review.output.questions,
        evidence: [],
      });

      await supabase.from("agent_messages").insert({
        room_id: room.id,
        opportunity_id: opportunity.id,
        author_type: "agent",
        agent_code: review.agent_code,
        message_type: "analysis",
        content: review.output.summary,
        confidence: review.output.confidence,
        evidence: review.output.facts,
      });
    }

    const reviewMap = Object.fromEntries(
      independentResults.map((row) => [row.agent_code, row])
    );

    const crossResults = await Promise.all(
      CROSS_PAIRS.map(async ([agentA, agentB]) => {
        const a = reviewMap[agentA];
        const b = reviewMap[agentB];

        const result = await callStructuredModel({
          model: specialistModel,
          schemaName: `${agentA}_${agentB}_cross_check`,
          schema: crossCheckSchema,
          system: `You are facilitating a strict peer cross-examination between two BIOTRIX specialists. Generate one material challenge from each specialist to the other. Do not manufacture facts. Focus on assumptions that could change the decision.`,
          prompt: `OPPORTUNITY:\n${safeJson(context)}\n\n${agentA.toUpperCase()} REVIEW:\n${safeJson(compactReview(a))}\n\n${agentB.toUpperCase()} REVIEW:\n${safeJson(compactReview(b))}`,
        });

        return { agentA, agentB, result, output: result.object };
      })
    );

    for (const cross of crossResults) {
      absorbUsage(cross.result);

      const challenges = [
        [cross.agentA, cross.agentB, cross.output.challenge_a],
        [cross.agentB, cross.agentA, cross.output.challenge_b],
      ];

      for (const [author, target, challenge] of challenges) {
        await supabase.from("founder_room_turns").insert({
          run_id: run.id,
          round_no: 2,
          turn_type: "cross_check",
          agent_code: author,
          target_agent_code: target,
          model_name: cross.result.model,
          content: challenge.challenge,
          structured_output: challenge,
          input_tokens: 0,
          output_tokens: 0,
          estimated_cost_usd: 0,
        });

        await supabase.from("agent_messages").insert({
          room_id: room.id,
          opportunity_id: opportunity.id,
          author_type: "agent",
          agent_code: author,
          message_type: "challenge",
          content: `→ ${target}: ${challenge.challenge}\n왜 중요한가: ${challenge.why_material}\n검증 방법: ${challenge.falsification_test}`,
          evidence: [],
        });
      }
    }

    const challengerPrompt = promptMap.challenger;
    if (!challengerPrompt) throw new Error("missing_prompt_challenger");

    const redTeamResult = await callStructuredModel({
      model: redTeamModel,
      schemaName: "red_team_review",
      schema: redTeamSchema,
      system: `${challengerPrompt.system_prompt}\n\n${challengerPrompt.instructions || ""}`,
      prompt: `Round 3 Red Team. Attack the current thesis after reading all independent reviews and cross-checks.\n\nOPPORTUNITY:\n${safeJson(context)}\n\nREVIEWS:\n${safeJson(independentResults.map(compactReview))}\n\nCROSS CHECKS:\n${safeJson(crossResults.map((x)=>({pair:[x.agentA,x.agentB],output:x.output})))}`,
    });

    absorbUsage(redTeamResult);

    await supabase.from("founder_room_turns").insert({
      run_id: run.id,
      round_no: 3,
      turn_type: "red_team",
      agent_code: "challenger",
      model_name: redTeamResult.model,
      content: redTeamResult.object.strongest_counterargument,
      structured_output: redTeamResult.object,
      input_tokens: redTeamResult.inputTokens,
      output_tokens: redTeamResult.outputTokens,
      estimated_cost_usd: redTeamResult.estimatedCostUsd,
    });

    await supabase.from("agent_messages").insert({
      room_id: room.id,
      opportunity_id: opportunity.id,
      author_type: "agent",
      agent_code: "challenger",
      message_type: "challenge",
      content: `가장 강한 반론: ${redTeamResult.object.strongest_counterargument}\n실패 시나리오: ${redTeamResult.object.failure_modes.join(" / ")}\n권고: ${redTeamResult.object.recommendation}`,
      confidence: redTeamResult.object.confidence,
    });

    const chiefPrompt = promptMap.chief_staff;
    if (!chiefPrompt) throw new Error("missing_prompt_chief_staff");

    const synthesisResult = await callStructuredModel({
      model: synthesisModel,
      schemaName: "decision_packet",
      schema: synthesisSchema,
      system: `${chiefPrompt.system_prompt}\n\n${chiefPrompt.instructions || ""}\n\nYou may recommend a decision but the human Founder is the only final decision maker.`,
      prompt: `Round 4 synthesis. Build a decision packet from the full debate. Do not erase disagreement.\n\nOPPORTUNITY:\n${safeJson(context)}\n\nREVIEWS:\n${safeJson(independentResults.map(compactReview))}\n\nCROSS CHECKS:\n${safeJson(crossResults.map((x)=>({pair:[x.agentA,x.agentB],output:x.output})))}\n\nRED TEAM:\n${safeJson(redTeamResult.object)}`,
    });

    absorbUsage(synthesisResult);

    await supabase.from("founder_room_turns").insert({
      run_id: run.id,
      round_no: 4,
      turn_type: "synthesis",
      agent_code: "chief_staff",
      model_name: synthesisResult.model,
      content: synthesisResult.object.executive_summary,
      structured_output: synthesisResult.object,
      input_tokens: synthesisResult.inputTokens,
      output_tokens: synthesisResult.outputTokens,
      estimated_cost_usd: synthesisResult.estimatedCostUsd,
    });

    await supabase.from("agent_messages").insert({
      room_id: room.id,
      opportunity_id: opportunity.id,
      author_type: "agent",
      agent_code: "chief_staff",
      message_type: "synthesis",
      content: `${synthesisResult.object.executive_summary}\n\n추천: ${synthesisResult.object.recommendation.toUpperCase()}\n근거: ${synthesisResult.object.rationale}`,
      confidence: synthesisResult.object.confidence,
    });

    await supabase.from("decision_packets").insert({
      room_id: room.id,
      opportunity_id: opportunity.id,
      title: `${opportunity.title} · Decision Packet`,
      facts: synthesisResult.object.verified_facts,
      agreements: synthesisResult.object.agreements,
      disagreements: synthesisResult.object.disagreements,
      unknowns: synthesisResult.object.unknowns,
      proposed_actions: synthesisResult.object.proposed_actions,
      recommendation: synthesisResult.object.recommendation,
      recommendation_rationale: synthesisResult.object.rationale,
      status: "review",
    });

    await supabase
      .from("opportunities")
      .update({
        stage: "decision",
        updated_at: new Date().toISOString(),
      })
      .eq("id", opportunity.id);

    await supabase
      .from("founder_room_runs")
      .update({
        status: "completed",
        calls_used: callsUsed,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        estimated_cost_usd: estimatedCostUsd,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    revalidatePath("/founder-room");
  } catch (error) {
    await supabase
      .from("founder_room_runs")
      .update({
        status: "failed",
        calls_used: callsUsed,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        estimated_cost_usd: estimatedCostUsd,
        error_message: String(error?.message || error).slice(0, 1000),
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    await supabase.from("agent_messages").insert({
      room_id: room.id,
      opportunity_id: opportunity.id,
      author_type: "system",
      message_type: "system",
      content: `Roundtable failed: ${String(error?.message || error).slice(0, 500)}`,
    });

    revalidatePath("/founder-room");
    throw error;
  }
}
