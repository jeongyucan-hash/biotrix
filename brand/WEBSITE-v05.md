# Website brand release v0.5

Approved design source: BIOTRIX_Vector_Master_System.zip, masters/BIOTRIX_MASTER_Green.svg and White.svg
Geometry is copied unchanged; no raster regeneration or new lettering

Website body fonts: original OFL Manrope and Pretendard, delivered as subsets
Default language: Korean, preserving existing visitor preference
Approved homepage copy stays in assets/brand-v04/app-v05.js
Build static pages: node scripts/build-v05.cjs
Checks: node scripts/check-lockup.mjs; python3 scripts/audit-site.py
When adding copy, regenerate font subsets from all HTML and app-v05.js to include new Korean characters
Business registration data is preserved in assets/brand-v04/privacy.html and terms.html
Main public site and HQ are separate deployment targets
