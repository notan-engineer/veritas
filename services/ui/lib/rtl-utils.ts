export type Language = 'en' | 'he' | 'ar' | 'other';

export function isRTL(language: Language): boolean {
  return language === 'he' || language === 'ar';
}

export function getTextDirection(language: Language): 'ltr' | 'rtl' {
  return isRTL(language) ? 'rtl' : 'ltr';
}

export function getRTLClasses(language: Language): string {
  if (isRTL(language)) {
    return 'rtl text-right';
  }
  return 'ltr text-left';
}

export function getRTLContainerClasses(language: Language): string {
  if (isRTL(language)) {
    return 'rtl';
  }
  return 'ltr';
}

export function getRTLFlexDirection(language: Language): string {
  if (isRTL(language)) {
    return 'flex-row-reverse';
  }
  return 'flex-row';
}

export function getRTLGapDirection(language: Language): string {
  if (isRTL(language)) {
    return 'gap-x-reverse';
  }
  return '';
} 