import { describe, expect, it } from 'vitest';

import {
  gentleItemVariants,
  relaxedContainerVariants,
  snappyItemVariants,
  tightContainerVariants,
} from './motion';

describe('shared motion variants', () => {
  it('preserves both page pacing profiles', () => {
    expect(tightContainerVariants.visible).toMatchObject({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    });
    expect(relaxedContainerVariants.visible).toMatchObject({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    });
  });

  it('preserves the spring and eased item animations', () => {
    expect(snappyItemVariants.visible).toMatchObject({
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    });
    expect(gentleItemVariants.visible).toMatchObject({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    });
  });
});
