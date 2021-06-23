import { VFC } from 'react';

export const Home: VFC = () => (
  <main>
    <h1>Welcome to clean.dev</h1>

    <p>
      Lorem, ipsum dolor sit amet consectetur adipisicing elit.
      Nobis a tempore reprehenderit eius, tenetur minus vero.
      Mollitia ea ab vel laudantium eveniet quis delectus accusamus ipsa. Deleniti sequi iusto aperiam.
    </p>

    <article className="latest-posts">
      <h2>Latest Posts</h2>
      <article className="post">
        <h3>Catchy Headline but not Clickbait of course</h3>
        <figure>
          <picture>
            <source media="(max-width: 699px)" srcSet="https://picsum.photos/200/300" />
            <source media="(min-width: 700px)" srcSet="https://picsum.photos/300/200" />
            <img src="https://picsum.photos/300/200" alt="Test" />
          </picture>
          <figcaption>A picture says more than a thousand words</figcaption>
        </figure>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Nihil laudantium eaque nulla, sapiente quibusdam voluptatibus quasi ratione!
          Totam molestiae ea suscipit quo hic, omnis minima, fuga repellat exercitationem vel tenetur?
        </p>
      </article>
    </article>

  </main>
);
