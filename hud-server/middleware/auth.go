package middleware

import (
	"fmt"
	"os"

	"github.com/golang-jwt/jwt/v5"

	"github.com/gin-gonic/gin"
)

func Auth() gin.HandlerFunc {
	return func(context *gin.Context) {
		tokenString := context.GetHeader("Authorization")

		println("TOKEN STRING IS: ", tokenString)

		if tokenString == "" {
			context.JSON(401, gin.H{"error": "request does not contain an access token"})
			context.Abort()
			return
		}

		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("SERVER_SECRET")), nil
		})
		// ... error handling

		println("TOKEN IS: ", token)

		// do something with decoded claims
		for key, val := range claims {
			fmt.Printf("Key: %v, value: %v\n", key, val)
		}

		if err != nil {
			context.JSON(401, gin.H{"error": err.Error()})
			context.Abort()
			return
		}
		context.Next()
	}
}
