import { Element, api } from 'engine';

export default class relatedListPlusPlus extends Element {

  @api title;
  @api iconName;
  @api maxRows;
  @api fields;
  @api relatedObject;

}