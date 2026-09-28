# Search ownership and crawl files

The live Google and Naver verification values are already issued. Their single edit location for the public site is the corresponding `google-site-verification` and `naver-site-verification` meta tags in the `<head>` of `index.html`. Replace only the `content` value when an engine issues a new token; do not add duplicate tags or put tokens in query strings. Do not commit account passwords or API credentials. Deploy, check the exact tag at `https://biotrix.co.kr/`, then complete ownership verification in the relevant webmaster console. A deployed tag does not itself prove console ownership.

`robots.txt` and `sitemap.xml` live at the repository root, which Vercel publishes at `/robots.txt` and `/sitemap.xml`. The sitemap lists only `/`, `/company`, `/business`, `/products`, `/partnership`, `/contact`, `/privacy`, `/terms`. Keep it aligned with publicly accessible canonical URLs when routes change.
