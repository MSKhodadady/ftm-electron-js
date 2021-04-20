CREATE TABLE "file_tag" (
	"file_name"	TEXT NOT NULL,
	"tag_name"	TEXT NOT NULL,
	"tag_value"	TEXT,
	PRIMARY KEY("file_name","tag_name")
);