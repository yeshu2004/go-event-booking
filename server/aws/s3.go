package aws

import (
	"bytes"
	"context"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func LoadAwsConifg() aws.Config {
	cfg, err := config.LoadDefaultConfig(context.Background(), config.WithRegion("ap-south-1"))
	if err != nil {
		log.Fatalf("AWS config error: %v", err)
	}
	return cfg
}

type S3Service struct {
	client *s3.Client
}

func NewS3Service(cfg aws.Config) *S3Service {
	return &S3Service{
		client: s3.NewFromConfig(cfg),
	}
}

// GetPresignDownloadURL return download image pres-signed url to client
func (s *S3Service) GetPresignDownloadURL(ctx context.Context, bucketName, keyName string) (string, error) {
	presignClient := s3.NewPresignClient(s.client)

	presigURL, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(keyName),
	}, s3.WithPresignExpires(10*time.Minute))

	if err != nil {
		return "", err
	}

	return presigURL.URL, nil
}

// GetPresignUploadURL return upload image pre-signed url to client
func (s *S3Service) GetPresignUploadURL(ctx context.Context, bucketName, keyName string) (string, error) {
	presignClient := s3.NewPresignClient(s.client)

	presignURL, err := presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(keyName),
	}, s3.WithPresignExpires(10*time.Minute))

	if err != nil {
		return "", err
	}

	return presignURL.URL, nil
}

func (s *S3Service) UploadObject(ctx context.Context, bucketName, keyName string, data []byte, contentType *string) error {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      &bucketName,
		Key:         &keyName,
		Body:        bytes.NewReader(data),
		ContentType: contentType,
	})
	return err
}
