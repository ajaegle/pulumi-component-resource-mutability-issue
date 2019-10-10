# Issue regarding mutability of ComponentResourceOptions

The ComponentResource constructor creates opts (containing the k8s provider) to pass down to the kubernetes resources.

When applying this program there seems to be some mutability of the probs that causes several resources to write to a shared object which causes duplicate alias errors. First time this happened was with an already existing stack that was extended (happened during preview), when starting from scratch it only panics when performing the update.

If the opts are created for each resource, this doesn't happen.

```shell script
Updating (dev):

     Type                                     Name                                            Status       Info
 +   pulumi:pulumi:Stack                      pulumi-component-resource-mutability-issue-dev  creating..
 +   ├─ ajaegle:componentres:mutabilityissue  mutability-issue                                created
 +   │  ├─ kubernetes:core:Namespace          namespace                                       created
 +   │  ├─ kubernetes:core:Service            whoami                                          creating.    Service initialization complete
 +   │  └─ kubernetes:apps:Deployment         whoami-one                                      created      Deployment initialization complete
 +   └─ pulumi:providers:kubernetes           k8s-provider                                    created
panic: fatal: An assertion has failed: Two resources ('urn:pulumi:dev::pulumi-component-resource-mutability-issue::ajaegle:componentres:mutabilityissue$kubernetes:apps/v1:Deployment::whoami-one' and 'urn:pulumi:dev::pulumi-component-resource-mutability-issue::ajaegle:componentres:mutabilityissue$kubernetes:core/v1:Service::whoami') aliased to the same: 'urn:pulumi:dev::pulumi-component-resource-mutability-issue::ajaegle:componentres:mutabilityissue$kubernetes:apps/v1:Deployment::whoami-one'

goroutine 297 [running]:
github.com/pulumi/pulumi/pkg/util/contract.failfast(...)
	/private/tmp/pulumi-20191001-29115-1u0fjxm/src/github.com/pulumi/pulumi/pkg/util/contract/failfast.go:23
github.com/pulumi/pulumi/pkg/util/contract.Assertf(0xc001162200, 0x22f3765, 0x37, 0xc00174bce0, 0x3, 0x3)
	/private/tmp/pulumi-20191001-29115-1u0fjxm/src/github.com/pulumi/pulumi/pkg/util/contract/assert.go:33 +0x198
github.com/pulumi/pulumi/pkg/resource/deploy.(*Snapshot).NormalizeURNReferences(0xc00109e240)
	/private/tmp/pulumi-20191001-29115-1u0fjxm/src/github.com/pulumi/pulumi/pkg/resource/deploy/snapshot.go:112 +0x6cb
github.com/pulumi/pulumi/pkg/backend.(*SnapshotManager).saveSnapshot(0xc001134480, 0xc00174bf30, 0x2)
	/private/tmp/pulumi-20191001-29115-1u0fjxm/src/github.com/pulumi/pulumi/pkg/backend/snapshot.go:565 +0x42
github.com/pulumi/pulumi/pkg/backend.NewSnapshotManager.func1(0xc0010843c0, 0xc001134480, 0xc001084420, 0xc001084480)
	/private/tmp/pulumi-20191001-29115-1u0fjxm/src/github.com/pulumi/pulumi/pkg/backend/snapshot.go:608 +0x12e
created by github.com/pulumi/pulumi/pkg/backend.NewSnapshotManager
	/private/tmp/pulumi-20191001-29115-1u0fjxm/src/github.com/pulumi/pulumi/pkg/backend/snapshot.go:597 +0x150
```
