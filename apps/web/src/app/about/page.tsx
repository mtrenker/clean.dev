import type { NextPage } from 'next';
import { SkillBar } from '../../components/SkillBar';

const AboutPage: NextPage= () => {
  return (
    <div className="container mx-auto p-4">
      <h2 className="mb-6 text-center text-3xl font-bold">Empowering Your Projects with Expertise and Innovation</h2>

      <div className="grid gap-4 md:grid-cols-2">

        <div className="service-card rounded-lg border p-4 shadow-md transition-shadow hover:shadow-lg">
          <h3 className="mb-2 text-xl font-semibold">Clean Web Development</h3>
          <p>Specializing in creating scalable, maintainable web applications with a focus on clean code and efficient design. Experience in JavaScript, TypeScript, Node.js, React, and more, ensuring your projects are built with the latest and most reliable technologies.</p>
        </div>

        <div className="service-card rounded-lg border p-4 shadow-md transition-shadow hover:shadow-lg">
          <h3 className="mb-2 text-xl font-semibold">Coaching</h3>
          <p>Providing mentorship and guidance to development teams, focusing on skill enhancement, clean code practices, and efficient workflows. My approach to coaching is tailored to boost team capabilities and foster a culture of continuous learning and improvement.</p>
        </div>

        <div className="service-card rounded-lg border p-4 shadow-md transition-shadow hover:shadow-lg">
          <h3 className="mb-2 text-xl font-semibold">Automation</h3>
          <p>Advocating for robust automation strategies in development processes. Specialized in implementing CI/CD pipelines and infrastructure as code using AWS CDK, enhancing efficiency, reducing errors, and accelerating deployment cycles.</p>
        </div>

        <div className="service-card rounded-lg border p-4 shadow-md transition-shadow hover:shadow-lg">
          <h3 className="mb-2 text-xl font-semibold">Agile Processes</h3>
          <p>Expertise in optimizing agile methodologies for software development. Skilled in roles like Scrum Master and aiding in backlog maintenance, I help teams adopt true agility, improving software quality and delivery speed.</p>
        </div>
      </div>

      <div>

        <SkillBar level={70} skill="HTML" />
        <SkillBar level={80} skill="CSS" />
        <SkillBar level={90} skill="JavaScript" />

      </div>
    </div>
  )
}

export default AboutPage;
