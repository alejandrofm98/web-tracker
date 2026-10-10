export default function TechnicalLocation({ value }: { value: string }) {
  return (
    <dd className="technical-location">
      {value.split(/(https?:\/\/[^\s<>"']+)/gi).map((part, index) => {
        if (!/^https?:\/\//i.test(part)) return part;
        return <a key={index} href={part} target="_blank" rel="noreferrer">{part}</a>;
      })}
    </dd>
  );
}
