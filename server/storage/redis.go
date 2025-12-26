package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/yeshu2004/go-event-booking/models"
)

var (
	cacheAllEventKey string = "events:all" 
)

type RedisServer struct {
	rdx *redis.Client
}

func GetRedisClient() (*RedisServer, error) {
	rdx := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password
		DB:       0,  // use default DB
		Protocol: 2,
	})

	ctx := context.Background()

	s, err := rdx.Ping(ctx).Result()
	if err != nil {
		return nil, err
	}
	fmt.Println(s, "Connection successful!")

	return &RedisServer{
		rdx: rdx,
	}, nil
}

func (r *RedisServer) SetEventsCache(ctx context.Context, events []models.EventCache) error{
	if r == nil || r.rdx == nil {
		return fmt.Errorf("redis not available")
	}

	key := cacheAllEventKey
	data, err := json.Marshal(events);
	if err != nil{
		return err;
	}

	// set into redis
	return r.rdx.Set(ctx, key, data, 10*time.Minute).Err()
}

func (r *RedisServer) GetCacheEvents(ctx context.Context)([]models.EventCache, error){
	if r == nil || r.rdx == nil {
		return nil, fmt.Errorf("redis not available")
	}

	key := cacheAllEventKey;
	res, err := r.rdx.Get(ctx, key).Result();
	if err != nil {
		if err == redis.Nil {
			return nil, nil // cache miss
		}
		return nil, err
	}

	var events  []models.EventCache
	if err := json.Unmarshal([]byte(res), &events); err != nil{
		return  nil, err
	}

	return events, nil
}

func (r *RedisServer)InvalidateEventsCache(ctx context.Context) error {
	return r.rdx.Del(ctx, cacheAllEventKey).Err()
}