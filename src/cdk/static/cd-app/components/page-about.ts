import { LitElement, html, property, customElement, css } from "lit-element";

import "./cd-service";

@customElement("page-about")
export class PageAbout extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }

      .container {
        max-width: 1440px;
        margin: 0 auto;
      }

      .about {
        background-color: #ededed;
      }

      .about .container {
        display: grid;
        grid-template:
          "name name image" max-content
          "title title image" max-content
          "description description image"
          / 1fr 1fr 350px;
        justify-content: flex-start;
      }

      .about img {
        grid-area: image;
      }
      .about h1 {
        grid-area: name;
      }
      .about h2 {
        grid-area: title;
      }
      .about p {
        grid-area: description;
      }

      .service-list {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 10px;
      }
    `;
  }

  render() {
    return html`
      <section class="about">
        <div class="container">
          <img src="https://picsum.photos/350" alt="Martin Trenker" />
          <h1>Martin Trenker</h1>
          <h2>Cloud Native Software Engineer</h2>
          <p>
            Clean code developer obsessed with Dev(Sec)Ops Culture, Serverless,
            Safety-II, Data Driven Everything, consulting companies from all
            industries and sizes since 2008
          </p>
        </div>
      </section>

      <section class="services">
        <div class="container">
          <h3>Services</h3>
          <p>
            My goal is to help my customers find relieable, resillient,
            maintainable and secure solutions to their unique requirements by
            using tools like hypothesis driven development, evolutionary
            microservice architecture, clean code best practices and hand help
            them adapt those practices themselves by engaging heavily in
            mentorship and as a servant leader if appropiate
          </p>
          <div class="service-list">
            <cd-service label="JavaScript/TypeScript">
              As my daily companion since over a decade, JavaScript and it's
              successor TypeScript have become mostly intuitive to me.
            </cd-service>

            <cd-service label="Optimize/Automate">
              I'm obsessed with the theory of constraints and try to optimnize
              or automate them away as much as possible to allow the team to
              concentrate on the important and fun stuff: developing features!
            </cd-service>

            <cd-service label="HTML/CSS">
              Semantic and thereby accessible markup is a requirement, not a
              feature, modern technologies like webcomponents allow us to create
              way better performing websites and it is widely supported already,
              the time is now!
            </cd-service>

            <cd-service label="Dev(Sec)Ops">
              DevOps culture can give your company superpowers, by encouraging
              truely cross functional teams and giving them the chance and, very
              important, psychological safety to try things out and learn from
              mistakes. Integrating those best practices correctly can make the
              difference by allowing fast deployments and quickly responding to
              the market. Round that up with making security a top priority for
              all teams and you have a product that will stand the tesst of
              times a bit longer.
            </cd-service>

            <cd-service label="Clean Code">
              It is hard to write good software and it gets more and more
              complex, especially with distributed systems, clean code helps us
              keep our sanity and saves companies money by drasitcally reducing
              onboarding time, increasing flexibility of the systems and
              therefore reducing the time from idea to customer.
            </cd-service>

            <cd-service label="Cloud Native">
              Managed services like S3, Lambda, API Gateway, SNS, SQS, DynamoDB
              and others allow companies and frontend developers like me to
              build highly resilient and scaling applications without caring
              about servers and paying for what is actually used. CDK makes
              <abbr title="infrastructure as code">iac</abbr> a breeze*
            </cd-service>

            <cd-service label="Testing">
              Tests don't have to be tedious or expensive and can have a huge
              impact on psychological safety inside the team, encouraging
              experiments, reducing side effects, keep the backlog free for
              features.
            </cd-service>

            <cd-service label="Big Data">
              Thanks to before mentioned services like SNS, SQS, S3, ... a
              relativeley top-shelf data lake is created within a few minutes
              and can provide a democratized source of truth for the various
              business metrics and create predictions with
              <abbr title="maschine learning">ML</abbr> with Sagemaker
            </cd-service>
          </div>
        </div>
      </section>

      <section class="customers">
        <div class="container">
          <h3>Customers</h3>
        </div>
      </section>
    `;
  }
}
