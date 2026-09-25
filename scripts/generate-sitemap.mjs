import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env vars
const envPath = resolve(__dirname, '..', '.env')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=')
  if (key && value.length) env[key.trim()] = value.join('=').trim()
})

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const BASE_URL = 'https://yoursite.com' // Update this to your actual domain

async function fetchSupabase(table, select = '*', params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${params}`
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  })
  if (!res.ok) return []
  return res.json()
}

function formatDate(date) {
  return new Date(date).toISOString().split('T')[0]
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function generateSitemap() {
  console.log('🔄 Generating dynamic sitemap...')

  // Static pages
  const staticPages = [
    { loc: BASE_URL, priority: '1.0', changefreq: 'daily' },
    { loc: `${BASE_URL}/jobs`, priority: '0.9', changefreq: 'daily' },
    { loc: `${BASE_URL}/articles`, priority: '0.9', changefreq: 'daily' },
    { loc: `${BASE_URL}/about`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${BASE_URL}/contact`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${BASE_URL}/privacy`, priority: '0.5', changefreq: 'yearly' },
    { loc: `${BASE_URL}/terms`, priority: '0.5', changefreq: 'yearly' },
  ]

  // Fetch articles
  let articles = []
  try {
    articles = await fetchSupabase('articles', 'slug,published_at,updated_at', '&status=eq.published&deleted_at=is.null')
    console.log(`📄 Found ${articles.length} published articles`)
  } catch (err) {
    console.warn('⚠️  Could not fetch articles:', err.message)
  }

  // Fetch jobs
  let jobs = []
  try {
    jobs = await fetchSupabase('jobs', 'id,created_at,updated_at', '&status=eq.active&deleted_at=is.null')
    console.log(`💼 Found ${jobs.length} active jobs`)
  } catch (err) {
    console.warn('⚠️  Could not fetch jobs:', err.message)
  }

  // Build sitemap XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

  // Static pages
  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${page.loc}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  }

  // Article pages
  for (const article of articles) {
    if (!article.slug) continue
    const lastmod = article.updated_at || article.published_at || new Date().toISOString()
    xml += `
  <url>
    <loc>${BASE_URL}/article/${escapeXml(article.slug)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  }

  // Job pages (once job detail page exists, use /jobs/:id)
  for (const job of jobs) {
    const lastmod = job.updated_at || job.created_at || new Date().toISOString()
    xml += `
  <url>
    <loc>${BASE_URL}/jobs/${escapeXml(job.id)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  }

  xml += `
</urlset>`

  // Write to public/sitemap.xml
  const outputPath = resolve(__dirname, '..', 'public', 'sitemap.xml')
  writeFileSync(outputPath, xml, 'utf-8')
  console.log(`✅ Sitemap generated: ${outputPath}`)
  console.log(`   Total URLs: ${staticPages.length + articles.length + jobs.length}`)
}

generateSitemap().catch(err => {
  console.error('❌ Error generating sitemap:', err)
  process.exit(1)
})
