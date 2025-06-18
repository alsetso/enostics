import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { DocLayout } from '../../components/doc-layout'
import { getSectionContent, getAllSections } from '../../content/sections'

interface DocSectionPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: DocSectionPageProps): Promise<Metadata> {
  const section = getSectionContent(params.id)
  
  if (!section) {
    return {
      title: 'Documentation - Enostics',
      description: 'Enostics documentation'
    }
  }

  return {
    title: `${section.title} - Enostics Documentation`,
    description: section.description,
    keywords: section.tags.join(', '),
  }
}

export async function generateStaticParams() {
  const sections = getAllSections()
  return sections.map((section) => ({
    id: section.id,
  }))
}

export default function DocSectionPage({ params }: DocSectionPageProps) {
  const section = getSectionContent(params.id)
  
  if (!section) {
    notFound()
  }

  return (
    <DocLayout section={section} />
  )
} 