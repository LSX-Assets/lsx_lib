export const isEnvBrowser = (): boolean => !(window as any).invokeNative;

// Basic no operation function
export const noop = () => {};

export const splitFAString = (faString:string) => {
  const [prefix, newIcon] = faString.split('-');
  if (!prefix || !newIcon) return {prefix: 'fas', newIcon: 'question'};
  return {prefix, newIcon};
}

export const numberToRoman = (num:number) => {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX']  
  return romanNumerals[num]
}

export const copyToClipboard = (text:string) => {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

export const openLink = (url:string) => {
  if (isEnvBrowser()) {
    window.open(url, '_blank');
  } else {
    // @ts-expect-error -- invokeNative exists in NUI
    window.invokeNative('openLink', url);
  } 
}