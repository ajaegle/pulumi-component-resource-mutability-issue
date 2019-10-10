import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import {ComponentResourceOptions} from "@pulumi/pulumi";

export interface MutabilityIssueComponentArgs {
    k8sProvider: k8s.Provider;
    namespaceName: string;
}

export class MutabilityIssueComponent extends pulumi.ComponentResource {
    private readonly k8sResourceOpts: ComponentResourceOptions;

    constructor(name: string, private args: MutabilityIssueComponentArgs, opts: pulumi.CustomResourceOptions = {}) {
        super("ajaegle:componentres:mutabilityissue", name, args, opts);
        this.k8sResourceOpts = {parent: this, provider: args.k8sProvider, ...opts};

        const namespace = this.createNamespace(this.args.namespaceName);
        const whoamiDeployment = this.createWhoami();
        this.registerOutputs();
    }

    public createNamespace(namespaceName: string) {
        return new k8s.core.v1.Namespace("namespace", {
            metadata: {name: namespaceName}
        }, this.k8sResourceOpts);
    }

    private createWhoami() {
        const whoamiAppLabels = {
            app: "whoami"
        };

        const deploymentOne = new k8s.apps.v1.Deployment("whoami-one", {
            metadata: {
                namespace: this.args.namespaceName,
            },
            spec: {
                selector: { matchLabels: whoamiAppLabels },
                replicas: 1,
                template: {
                    metadata: { labels: whoamiAppLabels },
                    spec: {
                        containers: [
                            {
                                name: "main",
                                image: `ajaegle/whoami:1.0.0`,
                                ports: [{containerPort: 80}],
                            }
                        ]
                    }
                }
            }
        }, this.k8sResourceOpts);

        const service = new k8s.core.v1.Service("whoami", {
            metadata: {
                namespace: this.args.namespaceName,
            },
            spec: {
                selector: whoamiAppLabels,
                ports: [{
                    name: "http",
                    port: 80,
                }]
            }
        }, this.k8sResourceOpts);

        return {deploymentOne, service};
    }
}