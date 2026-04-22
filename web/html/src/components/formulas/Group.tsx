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
      className={`level-${level}`}
    >
      {/* <SectionToggle setVisible={setVisibility} isVisible={isVisible}> */}
        <h5 id={props.id} key={props.id}>
          {isFiltered(props.criteria) ? (
            <Highlight
              enabled={isFiltered(props.criteria)}
              text={props.header ? props.header.toString() : ""}
              highlight={props.criteria}
            />
          ) : (
            props.header
          )}
        </h5>
      {/* </SectionToggle> */}
      <div>
        
          <Fragment>
            {props.help ? <p>{props.help}</p> : null}
            {props.children}
          </Fragment>
        
      </div>
    </div>
  ) : null;
};

export default Group;
