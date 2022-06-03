---
name: Radio button
category: Forms
platforms:
  - android
  - ios
  - web
keywords:
  - RadioButton
  - selection
  - choices
  - options
  - pick
  - single selection form
  - choice form
  - option button
  - radio button form
  - toggle
  - switch
examples:
  - fileName: default-radio-button.tsx
    title: Default radio button
    description: >-
      Use radio buttons where merchants must make a single
      selection.undefinedundefined
  - fileName: toggle.tsx
    title: Toggle
    description: >-
      Use toggles when merchants need to make a binary choice (on or
      off).undefinedundefined
---

# Radio button

Use radio buttons to present each item in a list of options where merchants must
make a single selection.

---

## Best practices

Radio buttons should:

- Always be used with an associated label component.
- Be part of a list of radio buttons that:
  - Include at least two or more choices.
  - Are used to have merchants select only one option.
  - Include mutually exclusive options—this means that each option must be
    independent from every other option in the list. For example: Red, blue, and
    yellow are mutually exclusive. Red, blue, yellow, red/blue are not mutually
    exclusive.
  - List options in a rational order that makes logical sense.
  - Have a default option selected whenever possible.

---

## Content guidelines

### Radio button labels

Radio button labels should:

- Be introduced with a colon or a heading
- Start with a capital letter

<!-- usagelist -->

#### Do

- Option 1

#### Don’t

- option 1

<!-- end -->

- Not end in punctuation if it’s a single sentence, word, or a fragment

<!-- usagelist -->

#### Do

- Red

#### Don’t

- Red;

<!-- end -->

### Toggle (Android and iOS only)

Toggle labels should:

- Be clear what merchants are enabling or disabling
- Start with a capital letter

Toggle values should:

- Never be labeled

---

## Related components

- To make simple lists of radio buttons easier to build, [use the choice list component](https://polaris.shopify.com/components/forms/choice-list)
- For long lists of options, [consider the select component](https://polaris.shopify.com/components/forms/select) to avoid overwhelming merchants
- To present merchants with a list of checkboxes, [use the choice list component](https://polaris.shopify.com/components/forms/choice-list) with the “allow multiple” option
- To display non-interactive list of related content, [use the content list component](https://polaris.shopify.com/components/lists-and-tables/list)

---

## Accessibility

<!-- content-for: android -->

See Material Design and development documentation about accessibility for Android:

- [Accessible design on Android](https://material.io/design/usability/accessibility.html)
- [Accessible development on Android](https://developer.android.com/guide/topics/ui/accessibility/)

<!-- /content-for -->

<!-- content-for: ios -->

See Apple’s Human Interface Guidelines and API documentation about accessibility for iOS:

- [Accessible design on iOS](https://developer.apple.com/design/human-interface-guidelines/ios/app-architecture/accessibility/)
- [Accessible development on iOS](https://developer.apple.com/accessibility/ios/)

<!-- /content-for -->

<!-- content-for: web -->

Screen readers convey the state of the radio button automatically.

- Use the `disabled` prop to apply the HTML `disabled` attribute to the radio button `<input>`. This prevents merchants from being able to interact with the radio button, and conveys its inactive state to assistive technologies.
- Use the `id` prop to provide a unique `id` attribute value for the radio button. If an `id` isn’t provided, then the component generates one. All radio buttons must have unique `id` values to work correctly with assistive technologies.

### Labeling

- The required `label` prop conveys the purpose of the radio button to all merchants
- Use the `labelHidden` prop to visually hide the label but make it available to assistive technologies
- When you provide help text via the `helpText` prop or an inline error message via the `error` prop, the help or error content is conveyed to screen reader users with the `aria-describedby` attribute

### Keyboard support

- Move focus to the radio button group using the <kbd>tab</kbd> key (or <kbd>shift</kbd> + <kbd>tab</kbd> when tabbing backwards)
- Use the up and down arrow keys to change which radio button is selected

<!-- /content-for -->