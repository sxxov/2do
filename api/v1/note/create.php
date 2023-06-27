<?php

namespace api\v1\auth;

use api\v1\lib\auth\Authenticator;
use api\v1\lib\common\ResErr;
use api\v1\lib\common\ResErrCodes;
use api\v1\lib\common\ResOk;
use api\v1\lib\db\Db;
use api\v1\lib\db\DbInfo;
use api\v1\lib\note\Note;
use DateTime;
use mysqli_sql_exception;

$db = Db::connect(DbInfo::getApp());

$body = file_get_contents('php://input');
$in = json_decode($body);

if (!isset($in->username) || !isset($in->password) || !isset($in->email)) {
	return (new ResErr(ResErrCodes::INCOMPLETE))->echo();
}

$userId = (new Authenticator())->getSessionUser();

$datetime = new DateTime();
$dateCreated = $datetime->format('Y-m-d H:i:s');

$note = new Note(
	id: uniqid(),
	title: $in->title,
	owner: $userId,
	description: $in->$description,
	dateCreated: $dateCreated,
	dateModified: $dateCreated,
);
try {
	$db->query(
		<<<SQL
		INSERT INTO notes (
			todo_id,
			title,
			owner,
			description,
			dateCreated,
			dateModified
		)
		VALUES (
			"{$note->id}",
			"{$db->real_escape_string($note->title)}",
			"{$note->owner}",
			"{$db->real_escape_string($note->description)}",
			"{$note->$dateCreated}",
			"{$note->$dateModified}"
		);
		SQL
		,
	);
} catch (mysqli_sql_exception $err) {
	return (new ResErr(
		ResErrCodes::NOTE_CREATION_ERROR,
		message: 'Failed to create note',
		detail: $err,
	))->echo();
}

return (new ResOk($note))->echo();

