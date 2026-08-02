export const LANG_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/

export interface OrderedEntity {
  order: number
}

export interface ReorderEntry {
  id: string
  order: number
}

export type Translated<T> = Map<string, T>

export interface ResolvedPortfolio {
  lang: string
  availableLangs: LocaleSummary[]
  person: Record<string, unknown>
  ui: Record<string, unknown>
  about: {
    paragraphs: string[]
    stats: Record<string, unknown>[]
  }
  experiences: Record<string, unknown>[]
  projects: Record<string, unknown>[]
  skillCategories: Record<string, unknown>[]
  education: {
    degrees: Record<string, unknown>[]
    certifications: Record<string, unknown>[]
    spokenLanguages: Record<string, unknown>[]
  }
  achievements: {
    volunteering: Record<string, unknown>[]
    awards: Record<string, unknown>[]
  }
}

export interface LocaleSummary {
  code: string
  label: string
  flagCode: string
}
