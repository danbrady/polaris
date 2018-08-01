import * as React from 'react';
import ComboBox from '..';
import OptionList from '../../OptionList';
import Popover from '../../Popover';
import {mountWithAppProvider} from '../../../../tests/utilities';

describe('<ComboBox/>', () => {
  const options = [
    {value: 'cheese_pizza', label: 'Cheese Pizza'},
    {value: 'macaroni_pizza', label: 'Macaroni Pizza'},
    {value: 'pepperoni_pizza', label: 'Pepperoni Pizza'},
  ];

  describe('id', () => {
    it('passes the given id to its optionlist', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox
          id="CustomId"
          options={options}
          selected={[]}
          textField={renderTextField()}
          onSelect={emptyFunction}
        />,
      );
      expect(comboBox.find(OptionList).prop('id')).toBe('CustomId');
    });
  });

  describe('textField', () => {
    it('renders a custom given input', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox
          options={options}
          selected={[]}
          textField={<input type="text" />}
          onSelect={emptyFunction}
        />,
      );
      expect(comboBox.find('input').exists()).toBe(true);
      expect(comboBox.find(ComboBox.TextField).exists()).toBe(false);
    });
  });

  describe('popover', () => {
    it('renders a popover if the prop is true', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox
          popover
          options={options}
          selected={[]}
          textField={renderTextField()}
          onSelect={emptyFunction}
        />,
      );
      expect(comboBox.find(Popover).exists()).toBe(true);
    });

    it('does not render a popover if the prop is false', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox
          popover={false}
          options={options}
          selected={[]}
          textField={renderTextField()}
          onSelect={emptyFunction}
        />,
      );
      expect(comboBox.find(Popover).exists()).toBe(false);
    });
  });

  describe('allowMultiple', () => {
    it('renders a button if the prop is false', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox
          options={options}
          selected={[]}
          textField={renderTextField()}
          onSelect={emptyFunction}
          allowMultiple={false}
        />,
      );

      expect(comboBox.find('button').exists()).toBe(true);
    });

    it('renders a checkbox if the prop is set to true', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox
          options={options}
          selected={[]}
          textField={renderTextField()}
          onSelect={emptyFunction}
          allowMultiple
        />,
      );

      expect(comboBox.find('input[type="checkbox"]').exists()).toBe(true);
    });
  });

  describe('append and prepend', () => {
    it('renders content passed into append', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox
          options={options}
          selected={[]}
          textField={renderTextField()}
          onSelect={emptyFunction}
          append={renderNodeWithId()}
        />,
      );
      expect(comboBox.find('#CustomNode').exists()).toBe(true);
    });

    it('renders content passed into prepend', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox
          options={options}
          selected={[]}
          textField={renderTextField()}
          onSelect={emptyFunction}
          prepend={renderNodeWithId()}
        />,
      );
      expect(comboBox.find('#CustomNode').exists()).toBe(true);
    });
  });

  describe('onSelect', () => {
    it('gets called when an item is clicked', () => {
      const spy = jest.fn();
      const comboBox = mountWithAppProvider(
        <ComboBox
          options={options}
          selected={[]}
          textField={renderTextField()}
          onSelect={spy}
        />,
      );
      comboBox
        .find('button')
        .at(0)
        .simulate('click');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('gets called when a checkbox is changed', () => {
      const spy = jest.fn();
      const comboBox = mountWithAppProvider(
        <ComboBox
          options={options}
          selected={[]}
          textField={renderTextField()}
          onSelect={spy}
          allowMultiple
        />,
      );
      comboBox
        .find('input[type="checkbox"]')
        .at(0)
        .simulate('change', {target: {checked: true}});
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});

function renderTextField() {
  return <ComboBox.TextField label="" onChange={emptyFunction} />;
}

function emptyFunction() {
  return {};
}

function renderNodeWithId() {
  return <div id="CustomNode" />;
}
