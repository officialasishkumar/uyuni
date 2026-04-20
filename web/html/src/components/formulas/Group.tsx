import { type ReactNode, Fragment, useEffect, useState } from "react";

import { SectionState } from "components/FormulaForm";
import { Highlight } from "components/table/Highlight";

import { isFiltered } from "./FormulaComponentGenerator";
import SectionToggle from "./SectionToggle";

type Props = {
  id: string;
  sectionsExpanded: SectionState;
  setSectionsExpanded: (SectionState) => void;
  header?: ReactNode;
  help?: ReactNode;
  children?: ReactNode;
  isVisibleByCriteria?: () => boolean;
  criteria: string;
  level?: number;
};

const Group = (props: Props) => {
  const [visible, setVisible] = useState(props.sectionsExpanded !== SectionState.Collapsed);
  const level = props.level ?? 0;
  const isTopLevel = level === 1;

  useEffect(() => {
    if (props.sectionsExpanded !== SectionState.Mixed) {
      setVisible(props.sectionsExpanded !== SectionState.Collapsed);
    }
  }, [props.sectionsExpanded]);

  const isVisible = () => {
    return visible;
  };

  const setVisibility = (index, visible) => {
    setVisible(visible);
    props.setSectionsExpanded(SectionState.Mixed);
  };
  

  return props.isVisibleByCriteria?.() ? (
    <div
      className={`
        level-${level}
        group-level-${level} 
        ${visible ? "formula-content-section-open" : "formula-content-section-closed"}
      `}
    >
      <SectionToggle setVisible={setVisibility} isVisible={isVisible}>
        <h4 id={props.id} key={props.id}>
          {isFiltered(props.criteria) ? (
            <Highlight
              enabled={isFiltered(props.criteria)}
              text={props.header ? props.header.toString() : ""}
              highlight={props.criteria}
            />
          ) : (
            props.header
          )}
        </h4>
      </SectionToggle>
      <div>
        {visible ? (
          <Fragment>
            {props.help ? <p>{props.help}</p> : null}
            {props.children}
          </Fragment>
        ) : null}
      </div>
    </div>
  ) : null;
};

export default Group;
