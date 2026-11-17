export function capitalizeFirstLetter(text: string): string {
    if (!text) return text;
  
    return text.replace(
      /^(\s*)(\p{L})/u,
      (_, whitespace: string, letter: string) =>
        whitespace + letter.toLocaleUpperCase("ru-RU"),
    );
  }