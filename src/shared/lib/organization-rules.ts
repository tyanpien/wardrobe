export function parseOrganizationRuleItems(value: string | string[] | null | undefined): string[] {
    const source = Array.isArray(value) ? value.join("\n") : value ?? "";
  
    return source
      .split(/\n|[,;]+/)
      .map((item) => item.replace(/^\s*[-–—•*]+\s*/, "").trim())
      .filter(Boolean)
      .filter((item, index, items) => items.indexOf(item) === index);
  }
  
  export function normalizeOrganizationRuleText(value: string): string {
    return parseOrganizationRuleItems(value).join(", ");
  }