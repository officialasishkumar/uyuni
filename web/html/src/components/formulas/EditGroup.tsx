import { Component, Fragment } from "react";

import { Button } from "components/buttons";
import { productName } from "core/user-preferences";

import { SectionState } from "components/FormulaForm";
import { Highlight } from "components/table/Highlight";
import { DEPRECATED_onClick } from "components/utils";
import HelpIcon from "components/utils/HelpIcon";

import { Formulas, Utils } from "utils/functions";

import {
  ElementDefinition,
  generateFormulaComponent,
  generateFormulaComponentForId,
  isFiltered,
} from "./FormulaComponentGenerator";
import SectionToggle from "./SectionToggle";

const EditGroupSubtype = Formulas.EditGroupSubtype;
const getEditGroupSubtype = Formulas.getEditGroupSubtype;
const deepCopy = Utils.deepCopy;
// circular dependencies are bad

type EditGroupProps = {
  id: string;
  key: any;
  disabled?: boolean;
  collapsible?: boolean;
  level?: number;
  value: any;
  formulaForm: any;
  element: ElementDefinition;
  sectionsExpanded: SectionState;
  setSectionsExpanded: (SectionState) => void;
  isVisibleByCriteria?: () => boolean;
  criteria: string;
};

type EditGroupState = {
  visible: boolean;
};

type InlineAddButtonProps = {
  className?: string;
};

type InlineDeleteButtonProps = {
  className?: string;
  disabled?: boolean;
  onClick: () => void;
};

/*
 * Base class for edit-group.
 * Based on the edit-group data, the corresponing shape of component is used.
 */
class EditGroup extends Component<EditGroupProps, EditGroupState> {
  constructor(props: EditGroupProps) {
    super(props);
    this.state = {
      visible: props.sectionsExpanded !== SectionState.Collapsed,
    };
  }

  componentDidMount() {
    if (Array.isArray(this.props.value) && this.props.value.length === 0 && !this.isDisabled()) {
      this.handleAddItem();
    }
  }

  componentDidUpdate(prevProps: Readonly<EditGroupProps>) {
    if (
      this.props.sectionsExpanded !== SectionState.Mixed &&
      this.props.sectionsExpanded !== prevProps.sectionsExpanded
    ) {
      this.setState({ visible: this.props.sectionsExpanded === SectionState.Expanded });
    }
  }

  isDisabled = () => {
    const formScope = this.props.formulaForm.props.scope;
    const elementScope = this.props.element.$scope;
    return (
      elementScope === "readonly" || (formScope !== elementScope && elementScope !== "system") || this.props.disabled
    );
  };

  handleAddItem = () => {
    if (this.props.element.$maxItems! <= this.props.value.length || this.isDisabled()) return;

    this.props.setSectionsExpanded(SectionState.Mixed);
    const newValueProps = this.props.value;
    const newValue = deepCopy(this.props.element.$newItemValue);

    newValueProps.push(newValue);

    this.props.formulaForm.handleChange({
      id: this.props.id,
      value: newValueProps,
    });
  };

  handleRemoveItem = (index: number) => {
    if (this.props.element.$minItems! >= this.props.value.length || this.isDisabled()) return;

    this.props.value.splice(index, 1);
    this.props.formulaForm.handleChange({
      id: this.props.id,
      value: this.props.value,
    });
  };

  isVisible = () => {
    return this.state.visible;
  };

  setVisible = (index, visible) => {
    // index not needed here
    this.setState({ visible: visible });
    this.props.setSectionsExpanded(SectionState.Mixed);
  };

  renderAddButton = (className = "btn btn-default") => {
    const rawName = this.props.element.$name || "";

    const cleanName = rawName.replace(/\s*\(.*?\)/, "");
    console.log(cleanName);
    return (
      <button
        className={className}
        type="button"
        data-bs-toggle="tooltip"
        title={
          this.props.element.$maxItems! <= this.props.value.length ? "Max number of items reached" : `Add ${cleanName}`
        }
        onClick={() => this.handleAddItem()}
        disabled={this.props.element.$maxItems! <= this.props.value.length || this.props.disabled}
      >
        <i className="fa fa-plus" /> {cleanName}
      </button>
    );
  };

  renderInlineAddButton = ({ className = "btn btn-default formula-inline-add-button" }: InlineAddButtonProps = {}) => (
    <button
      className={className}
      type="button"
      data-bs-toggle="tooltip"
      title={
        this.props.element.$maxItems! <= this.props.value.length
          ? "Max number of items reached"
          : `Add ${this.props.element.$name}`
      }
      onClick={() => this.handleAddItem()}
      disabled={this.props.element.$maxItems! <= this.props.value.length || this.props.disabled}
    >
      <i className="fa fa-plus" />
    </button>
  );

  renderInlineDeleteButton = ({
    className = "btn btn-tertiary formula-inline-delete-button",
    disabled = false,
    onClick,
  }: InlineDeleteButtonProps) => (
    <Button className={className} title="Remove item" handler={onClick} disabled={disabled} icon="fa-times" />
  );

  render() {
    const element = this.props.element;
    const subType = getEditGroupSubtype(element);
    const collapsible =
      this.props.collapsible !== false && (this.props.level ?? 1) !== 2 && (this.props.level ?? 1) !== 3 && (this.props.level ?? 1) !== 4;
    const showBottomAddButton =
      subType === EditGroupSubtype.LIST_OF_DICTIONARIES || subType === EditGroupSubtype.DICTIONARY_OF_DICTIONARIES;
    const isEditDictionaryGroup =
      subType === EditGroupSubtype.LIST_OF_DICTIONARIES || subType === EditGroupSubtype.DICTIONARY_OF_DICTIONARIES;

    let Component;
    if (subType === EditGroupSubtype.PRIMITIVE_LIST) {
      Component = EditPrimitiveGroup;
    } else if (subType === EditGroupSubtype.PRIMITIVE_DICTIONARY) {
      Component = EditPrimitiveDictionaryGroup;
    } else {
      Component = EditDictionaryGroup;
    }

    return this.props.isVisibleByCriteria?.() ? (
      <div
        id={this.props.id}
        className={
          !collapsible || this.isVisible()
            ? `level-${this.props.level ?? 1} formula-content-section-open`
            : `level-${this.props.level ?? 1} formula-content-section-closed`
        }
      >
        <div className="group-heading">
          {!collapsible ? (
            <h4 className={`heading-level-${this.props.level ?? 1}`}>
              <Highlight
                enabled={isFiltered(this.props.criteria)}
                text={this.props.element.$name}
                highlight={this.props.criteria}
              />
            </h4>
          ) : (
            <SectionToggle setVisible={this.setVisible} isVisible={this.isVisible}>
              <h4 className={`heading-level-${this.props.level ?? 1}`}>
                <Highlight
                  enabled={isFiltered(this.props.criteria)}
                  text={this.props.element.$name}
                  highlight={this.props.criteria}
                />
              </h4>
            </SectionToggle>
          )}
        </div>
        <div className={`group-level-${this.props.level ?? 1}`}>
          {!collapsible || this.state.visible ? (
            <Fragment>
              {"$help" in this.props.element ? (
                <div class="section-header">
                  {/* <h4 className="sub-heading">{this.props.element.$name}</h4> */}
                  {this.props.element.$name !== this.props.element.$help && <p>{this.props.element.$help}</p>}

                  {/* <div class="line"></div> */}
                </div>
              ) : // <h4 className="test">{this.props.element.$help}: </h4>
              null}
              <Component
                handleRemoveItem={this.handleRemoveItem}
                isDisabled={this.isDisabled()}
                id={this.props.id}
                key={this.props.key}
                level={this.props.level}
                element={this.props.element}
                value={this.props.value}
                sectionsExpanded={this.props.sectionsExpanded}
                setSectionsExpanded={this.props.setSectionsExpanded}
                formulaForm={this.props.formulaForm}
                renderInlineAddButton={showBottomAddButton ? undefined : this.renderInlineAddButton}
                renderInlineDeleteButton={showBottomAddButton ? undefined : this.renderInlineDeleteButton}
              />
              {showBottomAddButton ? (
                <div className={`offset-lg-3 col-lg-9 button-level-${this.props.level ?? 1}`}>
                  {this.renderAddButton((this.props.level ?? 1) === 2 ? "btn btn-tertiary" : "btn btn-default")}
                </div>
              ) : null}
            </Fragment>
          ) : null}
        </div>
      </div>
    ) : null;
  }
}

type EditPrimitiveGroupProps = {
  id: string;
  value: any;
  level?: number;
  element: ElementDefinition;
  formulaForm: any;
  isDisabled?: boolean;
  handleRemoveItem: (...args: any[]) => any;
  renderInlineAddButton?: (props?: InlineAddButtonProps) => React.ReactNode;
  renderInlineDeleteButton?: (props: InlineDeleteButtonProps) => React.ReactNode;
};

/*
 * Used for rendering edit-groups in the form of "list of primitive types",
 * to be rendered as a list of simple form elements in the UI.
 */
class EditPrimitiveGroup extends Component<EditPrimitiveGroupProps> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  simpleWrapper = (name, required, element, help = null) => {
    return (
      <Fragment>
        <div className="col-lg-3">
          {element}
          {required ? <span>*</span> : null}
        </div>
        <div className="col-lg-1 help-icon">
          <HelpIcon text={this.props.element["$help"]} />
        </div>
      </Fragment>
    );
  };

  render() {
    const elements: React.ReactNode[] = [];
    const itemIndexes = Object.keys(this.props.value).filter((i) => i !== "$meta");
    const lastItemIndex = itemIndexes[itemIndexes.length - 1];
    const canRemove = this.props.element.$minItems! < itemIndexes.length && !this.props.isDisabled;

    for (const i in this.props.value) {
      if (i === "$meta") {
        continue;
      }
      const id = this.props.id + "#" + i;
      elements.push(
        <div className="form-group edit-primitive-group-item" id={id} key={id}>
          <div className="col-lg-3 control-label"></div>
          {generateFormulaComponentForId(
            this.props.element.$prototype,
            this.props.value[i],
            this.props.formulaForm,
            id,
            this.simpleWrapper,
            this.props.isDisabled,
            this.props.level,
            false
          )}
          {i === lastItemIndex && this.props.renderInlineAddButton
            ? this.props.renderInlineAddButton({ className: "btn btn-default formula-inline-add-button" })
            : null}
          {i !== lastItemIndex && this.props.renderInlineDeleteButton
            ? this.props.renderInlineDeleteButton({
                className: "btn btn-tertiary formula-inline-delete-button",
                disabled: !canRemove,
                onClick: () => this.props.handleRemoveItem(i),
              })
            : null}
        </div>
      );
    }
    return (
      <div id={this.props.id + "$elements"} className={`ele editPrimitiveGroup ele-level-${this.props.level ?? 1}`}>
        {elements}
      </div>
    );
  }
}

type EditPrimitiveDictionaryGroupProps = {
  id: string;
  value: any;
  level?: number;
  element: ElementDefinition;
  formulaForm: any;
  isDisabled?: boolean;
  handleRemoveItem: (...args: any[]) => any;
  renderInlineAddButton?: (props?: InlineAddButtonProps) => React.ReactNode;
  renderInlineDeleteButton?: (props: InlineDeleteButtonProps) => React.ReactNode;
};

/*
 * Used for rendering edit-groups in the form of "dictionary of primitive types",
 * to be rendered as a list of [key, value] in the UI.
 */
class EditPrimitiveDictionaryGroup extends Component<EditPrimitiveDictionaryGroupProps> {
  pairElementWrapper(elementName) {
    return (name, required, element) => (
      <div className="col-lg-5 d-flex align-items-center" key={elementName}>
        <label className="col-lg-5 control-label">
          {elementName}
          {required ? <span className="required-form-field"> *</span> : null}:
        </label>
        <div className="col-lg-7">{element}</div>
      </div>
    );
  }
  // edit-primitive-dictionary-group-item
  render() {
    const elements: React.ReactNode[] = [];
    const itemIndexes = Object.keys(this.props.value).filter((i) => i !== "$meta");
    const lastItemIndex = itemIndexes[itemIndexes.length - 1];
    const canRemove = this.props.element.$minItems! < itemIndexes.length && !this.props.isDisabled;

    for (const i in this.props.value) {
      if (i === "$meta") {
        continue;
      }
      const id = this.props.id + "#" + i;
      elements.push(
        <div
          className="form-group pairElementWrapper edit-primitive-dictionary-group-item d-flex align-items-start"
          id={id}
          key={id}
        >
          {generateFormulaComponentForId(
            this.props.element.$prototype.$key,
            this.props.value[i][0],
            this.props.formulaForm,
            id + "#0",
            this.pairElementWrapper(this.props.element.$prototype.$key.$name),
            this.props.isDisabled,
            this.props.level,
            false
          )}
          {generateFormulaComponentForId(
            this.props.element.$prototype,
            this.props.value[i][1],
            this.props.formulaForm,
            id + "#1",
            this.pairElementWrapper(get(this.props.element.$prototype.$name, "Value")),
            this.props.isDisabled,
            this.props.level,
            false
          )}
          <div className="col-lg-2 d-flex align-items-start">
            {i === lastItemIndex && this.props.renderInlineAddButton
              ? this.props.renderInlineAddButton({ className: "btn btn-default pair-element-add-button" })
              : null}
            {i !== lastItemIndex && this.props.renderInlineDeleteButton
              ? this.props.renderInlineDeleteButton({
                  className: "btn btn-default formula-inline-delete-button",
                  disabled: !canRemove,
                  onClick: () => this.props.handleRemoveItem(i),
                })
              : null}
          </div>
        </div>
      );
    }
    return (
      <div
        id={this.props.id + "$elements"}
        className={`ele editPrimitiveDictionaryGroup ele-level-${this.props.level ?? 1}`}
      >
        {elements}
      </div>
    );
  }
}

type EditDictionaryGroupProps = {
  id: string;
  element: ElementDefinition;
  level?: number;
  value: any;
  isDisabled?: boolean;
  formulaForm: any;
  sectionsExpanded: SectionState;
  setSectionsExpanded: (SectionState) => void;
  handleRemoveItem: (...args: any[]) => any;
  renderInlineAddButton?: (props?: InlineAddButtonProps) => React.ReactNode;
};

type EditDictionaryGroupState = {
  visibility: Map<string, boolean>;
};

/*
 * Used for rendering edit-groups that are backed up list of dictionaries
 * to be rendered as a list of key-value groups in the UI.
 */
class EditDictionaryGroup extends Component<EditDictionaryGroupProps, EditDictionaryGroupState> {
  constructor(props) {
    super(props);
    this.state = {
      visibility: new Map(),
    };
  }

  componentDidUpdate(prevProps: Readonly<EditDictionaryGroupProps>) {
    if (
      this.props.sectionsExpanded !== SectionState.Mixed &&
      this.props.sectionsExpanded !== prevProps.sectionsExpanded
    ) {
      this.setAllVisible(this.props.sectionsExpanded === SectionState.Expanded);
    }
  }

  wrapKeyGroup(element_name, required, innerHTML) {
    return (
      <div className="form-group" key={element_name}>
        <label className="col-lg-3 control-label">
          {element_name}
          <span className="required-form-field"> *</span>:
        </label>
        <div className="col-lg-6">{innerHTML}</div>
        {/* Remove this? */}
        {/* <i
          className="fa fa-question-circle"
          title={t("This field is used as a 'key' identifier in the resulting pillar data.")}
        ></i> */}
      </div>
    );
  }

  generateItemName(item_index) {
    let name = this.props.element.$itemName;
    name = name.replace(/\${i}/g, parseInt(item_index, 10) + 1);
    name = name.replace(/\${.*}/g, (txt) => get(this.props.value[item_index][txt.substring(2, txt.length - 1)], txt));
    name = name.replace(/\${productName}/g, productName);
    return name;
  }

  isVisible = (index) => {
    return this.state.visibility.get(index) === undefined || this.state.visibility.get(index) !== false;
  };

  setVisible = (index, visible) => {
    const { visibility } = this.state;
    visibility.set(index, visible);
    this.props.setSectionsExpanded(SectionState.Mixed);
    this.setState({ visibility });
  };

  setAllVisible(visible) {
    const { visibility } = this.state;
    for (const i in this.props.value) {
      visibility.set(i, visible);
      this.setState({ visibility });
    }
  }

  render() {
    const elements: React.ReactNode[] = [];
    const itemIndexes = Object.keys(this.props.value).filter((i) => i !== "$meta");
    const lastItemIndex = itemIndexes[itemIndexes.length - 1];
    for (const i in this.props.value) {
      if (i === "$meta") {
        continue;
      }
      const id = this.props.id + "#" + i;

      const item_elements: React.ReactNode[] = [];
      console.log("info", this.props.element.$prototype);
      for (const element_name in this.props.element.$prototype) {
        if (element_name.startsWith("$") && element_name !== "$key") continue;
        item_elements.push(
          generateFormulaComponent(
            this.props.element.$prototype[element_name],
            this.props.value[i][element_name],
            this.props.formulaForm,
            id,
            element_name === "$key" ? this.wrapKeyGroup : undefined,
            this.props.isDisabled,
            (this.props.level ?? 1) + 1,
            false
          )
        );
      }

      elements.push(
        <div id={id} key={id} className="edit-dictionary-group-item">
          <div className={`group-heading `}>
            <h5 className={`heading-level-${this.props.level ?? 1}`}>{this.generateItemName(i)}</h5>
            <i
              className="fa fa-trash"
              data-bs-toggle="tooltip"
              title={
                this.props.element.$minItems! >= this.props.value.length ? "Min number of items reached" : "Remove item"
              }
              /* @ts-expect-error: The property `disabled` doesn't exist on the `<i>` tag, but this was here historically */
              disabled={this.props.element.$minItems! >= this.props.value.length || this.props.isDisabled}
              {...DEPRECATED_onClick(() => this.props.handleRemoveItem(i))}
            />
            {i === lastItemIndex && this.props.renderInlineAddButton
              ? this.props.renderInlineAddButton({
                  className: "btn btn-default btn-sm formula-inline-add-button formula-inline-heading-add-button",
                })
              : null}
          </div>
          <div>{item_elements}</div>
        </div>
      );
    }
    return (
      <div id={this.props.id + "$elements"} className={`ele editDictionaryGroup ele-level-${this.props.level ?? 1}`}>
        {elements}
      </div>
    );
  }
}

function get<T>(value?: T, default_value?: T) {
  if (value === undefined) return default_value;
  return value;
}

export default EditGroup;
