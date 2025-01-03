import airtel from "@/public/project_img/org-airtel.png"
import dh from "@/public/project_img/org-dh.jpg"
import mphasis from "@/public/project_img/org-mphasis.png"
import corpcommentImg from "@/public/corpcomment.png";
import rmtdevImg from "@/public/rmtdev.png";

export const links = [
  {
    name: "Home",
    hash: "/#home",
  },
  {
    name: "About",
    hash: "/#about",
  },
  {
    name: "Projects",
    hash: "/#projects",
  },
  {
    name: "Skills",
    hash: "/#skills",
  },
  {
    name: "Experience",
    hash: "/#experience",
  },
  {
    name: "Contact",
    hash: "/#contact",
  },  
  {
    name: "Blog",
    hash: "./blog",
  },
] as const;

export const companyWebsiteMap = {
  "Airtel Digital": "https://careers.airtel.com",
  "dunnhumby": "https://www.dunnhumby.com/careers/",
  "Mphasis": "https://careers.mphasis.com/home.html",
}
export const experiencesData = [
  {
    title: "Data Engineer",
    location: "Airtel Digital",
    type: "emmployment",
    description:
      "I work as a full-stack Data Engineer designing PetaByte scale data pipelines. My expertise is in Distributed Systems, and designing efficient data pipelines and data product APIs.",
    icon: airtel,
    // icon: React.createElement(FaReact),
    date: "2021 - present",
  },
  {
    title: "Data Science Engineer",
    location: "dunnhumby",
    description:
      "I worked as bridge b/w data scientist and big data platforms. I worked on multitude of ML and Statistic Analysis problems. I created products and solutions to be reused by diverse client base across world, including some of the biggest retailers in the world. I created Customer Segmentation, Setup data marts, reporting platform, on demand analytics product",
    icon: dh,
    date: "2018 - 2021",
  },
  {
    title: "Software Engineer",
    location: "Mphasis",
    description:
      "I worked in Mainframe and Big data ecosystem as a developer for Insurance and Telecom client. My role was instrumental in migraiton from Mainfram to Spark, along with some key automations which saved more than 1000 man hours per year.",
    icon: mphasis,
    date: "2014 - 2018",
  },
] as const;

export const projectsData = [
  {
    title: "Observability.",
    description:
      "Designed and implemented inhouse alerting and monitoring framework using elastic stack and custom applications.",
    tags: ["Elastic Stack", "Node.js", "MS Teams", "Kafka"],
  },
  {
    title: "Setup of Datamesh.",
    description:
      "Enabled DataMesh architecture using kyuubi, ranger, trino, s3, airflow, datahub, dbt & spark.",
    tags: ["Apache Kyuubi", "Trino", "Alluxio", "Datahub", "Jupyter"],
  },
  {
    title: "Automatic engine selection for Kyuubi.",
    description:
      "Patched codebase for dynamically allocating interactive or batch engine based on user AD groups.",
    tags: ["Apache Kyuubi", "java", "Apache Spark", "Trino"],
  },
  {
    title: "Portfolio website",
    description:
      "Created my website using nextJS. This is a portfolio website having a blog integration with WIX.",
    tags: ["React", "Next.js", "MongoDB", "Tailwind", "Prisma"],
  },
  {
    title: "Context Aware Rule Engine",
    description:
      "Developed a context aware platforn, which takes deisions based on user past activity in real time and to trigger business rules.",
    tags: ["Flink", "Kafka", "Java", "Elastic Stack", "Influx", "Airflow"],
  },
  {
    title: "Telecom - Network Datalake",
    description:
      "Designed and implemented a datalake, warehouse for network data comin from mobile towers. Managed data at petabyte scale with >2Trillion events coming every day.",
    tags: ["Flink", "Kafka", "Java", "Elastic Stack", "Influx", "Airflow", "NiFi"],
  },
  {
    title: "Retail - Cross Shopping Behaviour",
    description:
      "Developed solution for biggest retailers worldwide to analyse on how customers cross shop b/w departments, categories or products. This was enhanced with multiple customer segmentations",
    tags: ["Spark", "Python", "Power-BI", "Airflow"],
  },
  {
    title: "Retail - Association Rule Engine",
    description:
      "Developed solution for biggest retailers worldwide to analyse on how products are related, and which products, categories, or even departments are shopped together, Used Apriori algorithm at big data scale",
    tags: ["Spark", "Python", "Power-BI", "Airflow", "Statistics-Apriori"],
  },
  {
    title: "Retail - Category Uplift & Cannabalization",
    description:
      "Developed solution for biggest retailers worldwide to analyse on what is the impact of new product launch, how it isi adding to the sales and how much it cannibalises the other products in the same category.",
    tags: ["Spark", "Python", "Power-BI", "Airflow", "Statistics-Apriori"],
  },
] as const;

export const skillsData = [
  "Spark",
  "Flink",
  "Kubernetes (OCP)",
  "Python", 
  "Java",
  "MongoDB",
  "Cloud (GCP, AWS)",
  "Kafka",
  "MongoDB",
  "Elastic Stack",
  "Nifi",
  "Datahub",
  "DBT",
  "Airflow",
  "Influx",
  "Grafana",
] as const;
