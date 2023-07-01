<?php

namespace api\v1\auth;

use api\v1\lib\auth\Authenticator;
use api\v1\lib\common\ResErr;
use api\v1\lib\common\ResErrCodes;
use api\v1\lib\common\ResOk;
use api\v1\lib\db\Db;
use api\v1\lib\db\DbInfo;
use api\v1\lib\note\Note;
use mysqli_sql_exception;

$db = Db::connect(DbInfo::getApp());

$body = file_get_contents('php://input');
$in = json_decode($body);

if (!isset($in->id)) {
	return (new ResErr(ResErrCodes::INCOMPLETE))->echo();
}

$userRes = (new Authenticator())->getSessionUser();
$id = $in->id;

try {
	$res = $db->query(
		<<<SQL
		SELECT * FROM notes WHERE todo_id = "{$db->real_escape_string(
			$id,
		)}" AND owner = "{$db->real_escape_string($userRes->data['id'])}";
		SQL
		,
	);

	$row = $res->fetch_assoc();

	$note = new Note(
		id: $row['user_id'],
		title: $row['title'],
		owner: $row['owner'],
		description: $row['description'],
		dateCreated: $row['date_created'],
		dateModified: $row['date_modified'],
		done: (bool) $row['done'],
		priority: $row['priority'],
	);
} catch (mysqli_sql_exception $err) {
	return (new ResErr(ResErrCodes::UNKNOWN, detail: $err))->echo();
}

return (new ResOk($note))->echo();
