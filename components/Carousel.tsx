export type Props = {
  title: string;
};

function Carousel(props: Props) {
  return (
    <div>
      <h2>{props.title}</h2>
      <span>this is a carousel :P</span>
    </div>
  );
}

export default Carousel;
