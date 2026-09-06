import { DiceBearAvatarConfig } from '../types';

export const DEFAULT_AVATAR_CONFIGS: Record<string, DiceBearAvatarConfig> = {
  child_1: {
    style: 'big-smile',
    seed: 'LeoExplorer',
    hairColor: 'brown',
    skinColor: 'light',
  },
  child_2: {
    style: 'big-smile',
    seed: 'MiaStudent',
    hairColor: 'black',
    skinColor: 'medium',
  },
};

export function getAvatarSvgUrl(config?: DiceBearAvatarConfig): string {
  const style = config?.style || 'big-smile';
  const seed = encodeURIComponent(config?.seed || 'HeroKid');
  let url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&radius=50`;

  if (config?.backgroundColor) {
    url += `&backgroundColor=${config.backgroundColor.replace('#', '')}`;
  }
  if (config?.hairColor) {
    url += `&hairColor=${config.hairColor.replace('#', '')}`;
  }
  if (config?.skinColor) {
    url += `&skinColor=${config.skinColor.replace('#', '')}`;
  }

  return url;
}
