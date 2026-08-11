import React, { useEffect, useRef, useState } from 'react';

export default function LetterMaskHeading({
  children,
  className = '',
  tag: Tag = 'h2',
  style = {},
  id,
}) {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let globalIndex = 0;

  const processNode = (node, nodeIdx) => {
    if (typeof node === 'string') {
      const parts = node.split(/(\s+)/);
      return parts.map((part, pIdx) => {
        if (!part) return null;
        if (/^\s+$/.test(part)) {
          return (
            <span key={`space-${pIdx}`} style={{ display: 'inline' }}>
              {part}
            </span>
          );
        }
        const letters = [...part].map((char) => {
          const idx = globalIndex++;
          const delay = (idx * 0.09).toFixed(2);
          return (
            <span
              key={`char-${idx}`}
              className="letter-mask"
              style={{ overflow: 'hidden', display: 'inline-block', verticalAlign: 'bottom' }}
            >
              <span
                className="letter-inner"
                style={{
                  display: 'inline-block',
                  animationDelay: `${delay}s`,
                }}
              >
                {char}
              </span>
            </span>
          );
        });

        return (
          <span key={`word-${pIdx}`} className="word-wrapper" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {letters}
          </span>
        );
      });
    }

    if (React.isValidElement(node)) {
      if (node.type === 'br') {
        return <br key={`br-${nodeIdx}`} />;
      }
      if (node.props && node.props.children) {
        return React.cloneElement(
          node,
          { key: nodeIdx },
          React.Children.map(node.props.children, processNode)
        );
      }
    }

    return node;
  };

  const content = React.Children.map(children, processNode);

  return (
    <Tag
      ref={ref}
      id={id}
      className={`letter-mask-heading ${isRevealed ? 'revealed' : ''} ${className}`}
      style={style}
    >
      {content}
    </Tag>
  );
}
