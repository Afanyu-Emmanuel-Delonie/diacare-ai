import AlertBanner from '../../../components/common/AlertBanner.jsx';

const DEFAULT_DISCLAIMER =
  'This information is for educational purposes only and does not replace medical advice from a qualified healthcare professional.';

function KnowledgeDisclaimer({ text = DEFAULT_DISCLAIMER }) {
  return (
    <AlertBanner
      title="Health information notice"
      message={text || DEFAULT_DISCLAIMER}
      variant="info"
      badge="NOTICE"
      noticeId="knowledge-disclaimer"
    />
  );
}

export { DEFAULT_DISCLAIMER };
export default KnowledgeDisclaimer;
