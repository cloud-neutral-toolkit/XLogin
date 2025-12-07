package providers

import (
	"context"

	"github.com/example/xlogin/internal/oidc"
)

type ConsoleRequest struct {
	Provider string `json:"provider"`
	Target   string `json:"target"`  // accountId / projectId / subscriptionId / uid
	RoleKey  string `json:"roleKey"` // logical role key such as "admin" or "readonly"
}

type STSRequest struct {
	Provider string `json:"provider"`
	Target   string `json:"target"`
	RoleKey  string `json:"roleKey"`
}

type STSCredentials struct {
	AccessKeyId     string `json:"accessKeyId,omitempty"`
	AccessKeySecret string `json:"accessKeySecret,omitempty"`
	SecurityToken   string `json:"securityToken,omitempty"`
	AccessToken     string `json:"accessToken,omitempty"` // GCP/Azure use access tokens
	Expiration      string `json:"expiration,omitempty"`
}

type ConsoleProvider interface {
	Name() string
	ConsoleURL(ctx context.Context, claims *oidc.XLoginClaims, req ConsoleRequest) (string, error)
}

type STSProvider interface {
	Name() string
	STSToken(ctx context.Context, claims *oidc.XLoginClaims, req STSRequest, rawJWT string) (*STSCredentials, error)
}
