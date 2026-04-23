import { type ReactNode, Fragment, useEffect, useState } from "react";

import { SectionState } from "components/FormulaForm";
import { Highlight } from "components/table/Highlight";

import { isFiltered } from "./FormulaComponentGenerator";
import SectionToggle from "./SectionToggle";
import { group } from "console";

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
  const collapsible = level !== 2 && level !== 3 && level !== 4;

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
      id={props.id}
      className={
        !collapsible || isVisible()
          ? `level-${level} formula-content-section-open`
          : `level-${level} formula-content-section-closed`
      }
    >
      <div className="group-heading">
        {collapsible ? (
          <SectionToggle setVisible={setVisibility} isVisible={isVisible}>
            <h4 key={props.id}>
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
        ) : (
          <h4 key={props.id}>
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
        )}
      </div>
      <div className={`group-level-${level}  group-test`}>
        {!collapsible || visible ? (
          <Fragment>
            {props.help ? (
              <div className="section-header">
                {props.header !== props.help && <p className="testss">{props.help}</p>}
              </div>
            ) : null}
            {props.children}
          </Fragment>
        ) : null}
      </div>
    </div>
  ) : null;
};

export default Group;
