'use strict';

const cssnanoCONFIG = {
  autoprefixer: false,
  convertValues: false,
  core: true,
  discardComments: true,
  discardDuplicates: true,
  discardEmpty: true,
  discardOverridden: true,
  discardUnused: false,
  mergeLonghand: true,
  mergeRules: true,
  minifyFontValues: true,
  minifyParams: false,
  minifySelectors: false,
  normalizeUrl: false,
  reduceBackgroundRepeat: true,
  reduceIdents: false,
  svgo: true,
  zindex: false
};

module.exports = function(ctx) {
  return {
    plugins: {
      'postcss-import': true,
      'postcss-discard-empty': true,
      'postcss-custom-properties': {preserve:true,strict:true},
      'postcss-combine-duplicated-selectors': true,

      /**
       * HuHo created a lot of CSS custom properties starting with '--4gl'.
       * Despite the fact, that browsers don't mind about properties starting with number, 
       * this breaks CSS rules or at least controverses with their implementation in SASS.
       * As the result, SASS executable produces wrong result.
       * Plugin below is a workaround - because I don't know how many projects HuHo had contaminated already,
       * and it would be not enough just to fix property names in CSS/
       * The logic is as follows:
       * - source files have CSS custom properties in correct format: --fgl-color instead of --4gl-color;
       * - SASS processes source files and produces valid results;
       * - POSTCSS applies postcss-cssvalue-replace plugin to replace --fgl with --4gl
       */
      './postcss-cssvalue-replace': {"before": ["--fgl"], "after": ["--4gl"]},

      'postcss-prettify': true,
      cssnano: ctx.env === 'production' ? cssnanoCONFIG : false
    }
  };
}
