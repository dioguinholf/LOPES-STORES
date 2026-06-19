CC      = gcc
CFLAGS  = -Wall -Wextra -O2 -Iinclude -Ilib
LDFLAGS = $(shell mysql_config --libs) -lpthread

SRC = src/main.c db/db.c src/routes.c lib/mongoose.c
TARGET  = camisas-api

.PHONY: all clean run

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

run: all
	./$(TARGET)

clean:
	rm -f $(TARGET)
