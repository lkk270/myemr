"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { NodeApi, NodeRendererProps, Tree, TreeApi } from "react-arborist";
import styles from "./cities.module.css";
import { cities } from "./_data/cities";
import { BsMapFill, BsMap, BsGeo, BsGeoFill } from "react-icons/bs";
import { FillFlexParent } from "./fill-flex-parent";
import { MdArrowDropDown, MdArrowRight } from "react-icons/md";
import Link from "next/link";

type Data = { id: string; name: string; children?: Data[] };

const data = sortData(cities);
const INDENT_STEP = 15;

export const CitiesTree = ({ width = 300, height = 500 }) => {
  const [tree, setTree] = useState<TreeApi<Data> | null | undefined>(null);
  const [active, setActive] = useState<Data | null>(null);
  const [focused, setFocused] = useState<Data | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [count, setCount] = useState(0);
  const [followsFocus, setFollowsFocus] = useState(false);
  const [disableMulti, setDisableMulti] = useState(false);

  useEffect(() => {
    setCount(tree?.visibleNodes.length ?? 0);
  }, [tree, searchTerm]);

  // Function to determine if drop is allowed
  const disableDrop = ({ parentNode, dragNodes, index }: any) => {
    // Check if any of the dragged nodes are files and if they are being dropped into a folder
    const isDroppingFileIntoFolder = dragNodes.some(
      (dragNode: any) => dragNode.data.isFile && (!parentNode || !parentNode.data.children),
    );

    // Check if any of the dragged nodes have the same parent as the target parentNode
    // This will prevent reordering within the same folder but allow dropping into subfolders
    const isReorderingInSameFolder = dragNodes.some((dragNode: any) => dragNode.parent.id === parentNode.id);

    // Disable drop if either of the conditions are met
    return isDroppingFileIntoFolder || isReorderingInSameFolder;
  };

  return (
    <div>
      <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.currentTarget.value)} />

      {/* Pass the width to FillFlexParent as realWidth */}
      <FillFlexParent realWidth={width} height={height}>
        {(dimens) => (
          <Tree
            {...dimens}
            initialData={data}
            selectionFollowsFocus={followsFocus}
            disableMultiSelection={disableMulti}
            ref={(t) => setTree(t)}
            openByDefault={true}
            searchTerm={searchTerm}
            selection={active?.id}
            rowClassName={styles.row}
            padding={15}
            rowHeight={30}
            indent={INDENT_STEP}
            overscanCount={8}
            onSelect={(selected) => setSelectedCount(selected.length)}
            onActivate={(node) => setActive(node.data)}
            onFocus={(node) => setFocused(node.data)}
            disableDrop={disableDrop}
            onToggle={() => {
              setTimeout(() => {
                setCount(tree?.visibleNodes.length ?? 0);
              });
            }}
          >
            {Node}
          </Tree>
        )}
      </FillFlexParent>
    </div>
  );
};

function Node({ node, style, dragHandle }: NodeRendererProps<Data>) {
  const Icon = node.isInternal ? BsMapFill : BsGeoFill;
  const indentSize = Number.parseFloat(`${style.paddingLeft || 0}`);

  return (
    <div
      ref={dragHandle}
      style={style}
      className={clsx(styles.node, node.state)}
      onClick={() => node.isInternal && node.toggle()}
    >
      <div className={styles.indentLines}>
        {new Array(indentSize / INDENT_STEP).fill(0).map((_, index) => {
          return <div key={index}></div>;
        })}
      </div>
      <FolderArrow node={node} />
      <Icon className={styles.icon} />
      <span className={styles.text}>{node.isEditing ? <Input node={node} /> : node.data.name}</span>
    </div>
  );
}

function Input({ node }: { node: NodeApi<Data> }) {
  return (
    <input
      autoFocus
      name="name"
      type="text"
      defaultValue={node.data.name}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => node.reset()}
      onKeyDown={(e) => {
        if (e.key === "Escape") node.reset();
        if (e.key === "Enter") node.submit(e.currentTarget.value);
      }}
    />
  );
}

function sortData(data: Data[]) {
  function sortIt(data: Data[]) {
    data.sort((a, b) => (a.name < b.name ? -1 : 1));
    data.forEach((d) => {
      if (d.children) sortIt(d.children);
    });
    return data;
  }
  return sortIt(data);
}

function FolderArrow({ node }: { node: NodeApi<Data> }) {
  return (
    <span className={styles.arrow}>
      {node.isInternal ? node.isOpen ? <MdArrowDropDown /> : <MdArrowRight /> : null}
    </span>
  );
}
