import clsx from 'clsx';
import Image from 'next/image';
import React, { Fragment, useCallback } from 'react';
import Link from 'next/link';
import { CodeExample } from './CodeExample';

interface TextNode {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface LinkElement {
  type: 'link';
  nodeId?: string;
  href: string;
  children: TextNode[];
}

interface HeadingOneElement {
  type: 'heading-one';
  children: TextNode[];
}

interface HeadingTwoElement {
  type: 'heading-two';
  children: TextNode[];
}

interface HeadingThreeElement {
  type: 'heading-three';
  children: TextNode[];
}

interface ListItemChildElement {
  type: 'list-item-child';
  children: TextNode[];
}

interface ListItemElement {
  type: 'list-item';
  children: ListItemChildElement[];
}

interface BulletListElement {
  type: 'bulleted-list';
  children: ListItemElement[];
}

interface ImageElement {
  type: 'image';
  src: string;
  title: string;
  altText: string;
  width: number;
  height: number;
  mimeType: string;
  children: TextNode[];
}

interface ParagraphElement {
  type: 'paragraph';
  children: InlineElement[];
}

interface CodeBlockElement {
  type: 'code-block';
  children: InlineElement[];
}

interface CodeExampleElement {
  type: 'embed';
  nodeId: string;
  nodeType: 'CodeExample';
  children: TextNode[];
}

type InlineElement = LinkElement | TextNode;

export type SlateNode =
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
  | CodeExampleElement
  | CodeBlockElement;

export interface SlateRenderProps {
  value?: SlateNode[]
  references?: Record<string, string | null | undefined>[]
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
        className={clsx({
          'font-bold': node.bold,
          'italic': node.italic,
          'underline': node.underline,
        })}
        key={index}
      >
        {node.text}
      </span>
    );
  }, []);

  const renderNodes = useCallback((nodes: SlateNode[]) => {
    return nodes.map((node, index) => {
      if ('type' in node) {
        switch (node.type) {
        case 'paragraph':
          return (
            <p key={index}>
              {renderNodes(node.children)}
            </p>
          );
        case 'heading-one':
          return (
            <h1 key={index}>
              {renderNodes(node.children)}
            </h1>
          );
        case 'heading-two':
          return (
            <h2 key={index}>
              {renderNodes(node.children)}
            </h2>
          );
        case 'heading-three':
          return (
            <h3 key={index}>
              {renderNodes(node.children)}
            </h3>
          );
        case 'bulleted-list':
          return (
            <ul key={index}>
              {renderNodes(node.children)}
            </ul>
          );
        case 'list-item':
          return (
            <li key={index}>
              {renderNodes(node.children)}
            </li>
          );
        case 'list-item-child':
          return (
            <Fragment key={index}>
              {renderNodes(node.children)}
            </Fragment>
          );
        case 'link': {
          const ref = references?.find((r) => r.id === node.nodeId);
          const href = ref ? `/blog/${ref.slug}` : node.href;
          return (
            <Link
              href={href}
              key={index}
              rel={ref ? '' : 'noopener noreferrer'}
              target={ref ? '' : '_blank'}
            >
              {renderNodes(node.children)}
            </Link>
          );
        }
        case 'image':
          return (
            <figure key={index}>
              <Image
                alt={node.altText}
                height={node.height}
                src={node.src}
                title={node.title}
                unoptimized
                width={node.width}
              />
              <figcaption>{node.altText}</figcaption>
            </figure>
          );
        case 'embed': {
          const reference = references?.find((ref) => ref.id === node.nodeId);
          switch (node.nodeType) {
          case 'CodeExample': {
            return reference && (
              <CodeExample
                code={reference.code ?? undefined}
                description={reference.description}
                expression={reference.expression || ''}
                key={node.nodeId}
                name={reference.name || ''}
                owner={reference.owner || 'mtrenker'}
                repo={reference.repo || 'clean.dev'}
              />
            )
          }
          default:
            return null;
          }
        }
        case 'code-block':
          return (
            <pre className="max-w-[96vw] sm:max-w-none" key={index}>
              <code className="overflow-x-auto">
                {renderNodes(node.children)}
              </code>
            </pre>
          );
        default:
          return null;
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
