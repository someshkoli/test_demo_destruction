import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";

// Step 1: Create an ECS Fargate cluster.
const cluster = new awsx.ecs.Cluster("theiaJavaExamCluster");

// Step 2: Define the listner for our demo.
const nlb = new awsx.lb.NetworkLoadBalancer("nlb", { external: true })
const tg = nlb.createTargetGroup("tg", { port: 4000 });
const listener = tg.createListener("nginx", { port: 80 });

// Step 3: Build and publish a Docker image to a private ECR registry.
const image = awsx.ecs.Image.fromDockerBuild("theia-java-exam", {
      context: ".",
      extraOptions: ["-f", "app/exams/java_exam/Dockerfile"],
    });

const theiaJavaExamTaskDef = new awsx.ecs.FargateTaskDefinition("hello-world", {
    container: {
        image: image,
        essential: true,
        portMappings: [
            listener
        ]
    },
    family: "theiaJava",
    cpu: "256",
    memory: "512"
});

// Step 4: Create a Fargate service task that can scale out.
const appService = new awsx.ecs.FargateService("app-svc", {
    cluster,
taskDefinition: theiaJavaExamTaskDef,
    desiredCount: 1,
});

// Step 5: Export the Internet address for the service.
export const demoUrl = pulumi.interpolate `http://${listener.endpoint.hostname}/`;