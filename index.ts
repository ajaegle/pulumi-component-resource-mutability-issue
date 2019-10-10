import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import {MutabilityIssueComponent} from "./mutabilty-issue";

const context = new pulumi.Config().require("kube-context");
const k8sProvider = new k8s.Provider("k8s-provider", {context});

new MutabilityIssueComponent("mutability-issue", {k8sProvider, namespaceName: "pulumi-mutability-issue"});
