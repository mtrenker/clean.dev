import clsx from "clsx";
import Image from "next/image";
import React, { Fragment, useCallback } from "react";
import { CodeExample } from "./CodeExample";

type TextNode = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

type LinkElement = {
  type: "link";
  href: string;
  children: TextNode[];
};

type HeadingOneElement = {
  type: "heading-one";
  children: TextNode[];
};

type HeadingTwoElement = {
  type: "heading-two";
  children: TextNode[];
};

type HeadingThreeElement = {
  type: "heading-three";
  children: TextNode[];
};

type ListItemChildElement = {
  type: "list-item-child";
  children: TextNode[];
};

type ListItemElement = {
  type: "list-item";
  children: ListItemChildElement[];
};

type BulletListElement = {
  type: "bulleted-list";
  children: ListItemElement[];
};

type ImageElement = {
  type: "image";
  src: string;
  title: string;
  altText: string;
  width: number;
  height: number;
  mimeType: string;
  children: TextNode[];
};

type ParagraphElement = {
  type: "paragraph";
  children: InlineElement[];
};

type CodeExampleElement = {
  type: "embed";
  nodeId: string;
  nodeType: "CodeExample";
  children: TextNode[];
};

type InlineElement = LinkElement | TextNode;

type SlateNode =
  | TextNode
  | LinkElement
  | ImageElement
  | BulletListElement
  | ListItemElement
  | ListItemChildElement
  | ParagraphElement
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement
  | CodeExampleElement;

export interface SlateRenderProps {
  value?: SlateNode[]
  references?: any[]
}

export const SlateRender: React.FC<SlateRenderProps> = ({ value, references }) => {

  const renderLeaf = useCallback((node: TextNode, index: number) => {
    if (!node.bold && !node.italic && !node.underline) {
      return (
        <Fragment key={index}>
          {node.text}
        </Fragment>
      )
    }
    return (
      <span
        key={index}
        className={clsx({
          "font-bold": node.bold,
          "italic": node.italic,
          "underline": node.underline,
        })}
      >
        {node.text}
      </span>
    );
  }, []);

  const renderNodes = useCallback((nodes: SlateNode[]) => {
    return nodes.map((node, index) => {
      if ("type" in node) {
        switch (node.type) {
          case "paragraph":
            return (
              <p key={index}>
                {renderNodes(node.children)}
              </p>
            );
          case "heading-one":
            return (
              <h1 key={index}>
                {renderNodes(node.children)}
              </h1>
            );
          case "heading-two":
            return (
              <h2 key={index}>
                {renderNodes(node.children)}
              </h2>
            );
          case "heading-three":
            return (
              <h3 key={index}>
                {renderNodes(node.children)}
              </h3>
            );
          case "bulleted-list":
            return (
              <ul key={index}>
                {renderNodes(node.children)}
              </ul>
            );
          case "list-item":
            return (
              <li key={index}>
                {renderNodes(node.children)}
              </li>
            );
          case "list-item-child":
            return (
              <Fragment key={index}>
                {renderNodes(node.children)}
              </Fragment>
            );
          case "link":
            return (
              <a
                key={index}
                href={node.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {renderNodes(node.children)}
              </a>
            );
          case "image":
            return (
              <figure key={index}>
                <Image
                  src={node.src}
                  alt={node.altText}
                  title={node.title}
                  width={node.width}
                  height={node.height}
                  unoptimized
                />
                <figcaption>{node.altText}</figcaption>
              </figure>
            );
          case "embed": {
            const reference = references?.find((reference) => reference.id === node.nodeId);
            switch (node.nodeType) {
              case "CodeExample": {
                return (
                  <CodeExample
                    key={index}
                    owner={reference.owner || 'mtrenker'}
                    repo={reference.repo || 'clean.dev'}
                    expression={reference.expression}
                   />
                )
              }
              default:
                return null;
            }
          }
        }
      } else {
        return renderLeaf(node, index);
      }
    });
  }, [references, renderLeaf]);

  if (!value) {
    return null;
  }
  return (
    <>
      {renderNodes(value)}
    </>
  );
}
