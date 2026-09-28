# BIOTRIX Scribe MVP

A small Next.js transcription workspace for turning YouTube captions and uploaded audio/video into reusable text.

## MVP flow

1. Paste a YouTube URL.
2. If public captions are available, fetch timed caption segments.
3. If captions are unavailable, upload an audio/video file.
4. Uploaded files are transcribed with the OpenAI Transcriptions API.
5. The transcript can be summarized into key points, terminology and content ideas.

## Local setup

```bash
cd scribe-nextjs
npm install
cp .env.example .env.local
npm run dev
```

Required:

```
OPENAI_API_KEY=...
```

Optional:

```
OPENAI_TRANSCRIBE_MODEL=gpt-transcribe
OPENAI_SUMMARY_MODEL=gpt-5-mini
```

## Deployment

Create a separate Vercel project with root directory `scribe-nextjs`.
Keep `OPENAI_API_KEY` server-only.

## Important product decision

The YouTube path intentionally uses public caption data first. It does not download arbitrary YouTube media on the server. For captionless content, the current supported fallback is uploading media the user is authorized to process.

The `youtube-transcript` dependency uses an unofficial YouTube interface and can break when YouTube changes behavior. A production version should add an authorized YouTube/OAuth ingestion path for owned channels.

## Next milestones

- Supabase authentication + transcription history
- Supabase Storage for source files
- speaker diarization
- exports: Markdown / DOCX / SRT
- BIOTRIX Content Studio handoff
- usage and cost logging per transcription job
