import { tokenizeInlineCode } from './inlineCode';
import styles from './IssuesView.module.css';

function InlineCodeText({ text }: { text: string }) {
  return (
    <>
      {tokenizeInlineCode(text).map((token, i) =>
        token.type === 'code' ? (
          <code key={i} className={styles.inlineCode}>
            {token.value}
          </code>
        ) : (
          token.value
        )
      )}
    </>
  );
}

export default InlineCodeText;
