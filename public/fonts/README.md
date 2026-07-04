# Bundled Tanzaku Fonts

The projection screen loads Gothic-style vertical tanzaku fonts lazily when they are selected.

- `tanzaku-gothic.css`: Zen Kaku Gothic New, used for the 角ゴシック option.
- `tanzaku-maru.css`: Zen Maru Gothic, used for the 丸ゴシック option.
- `tanzaku-emoji.css`: Noto Color Emoji, used only when the experimental color emoji option is enabled.
- `vendor/*.woff2`: split WOFF2 subsets referenced by the CSS files.
- `licenses/`: SIL Open Font License text for each bundled font family.

These font files are from Google Fonts and are distributed under the SIL Open Font License.
The existing system font stacks remain in place as fallbacks, so the bundled fonts are only an enhancement for devices where vertical Japanese glyph support is insufficient.
