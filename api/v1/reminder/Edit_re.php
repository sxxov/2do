<?php    

    namespace api\v1\auth;

    use api\v1\lib\auth\Authenticator;
    use api\v1\lib\common\ResErr;
    use api\v1\lib\common\ResErrCodes;
    use api\v1\lib\common\ResOk;
    use api\v1\lib\db\Db;
    use api\v1\lib\db\DbInfo;
    use api\v1\lib\reminder\Reminder;
    use api\v1\lib\user\User;
    use mysqli;
    use mysqli_sql_exception;

    $db = Db::connect(DbInfo::getApp());

    $body = file_get_contents('php://inputs');
    $in = \json_decode($body);

    if (!isset($in->re_title) || !isset($in->re_datetime)) {
        return(new ResErr(ResErrCodes::INCOMPLETE))->echo();
    }

    $userRes = (new Authenticator())->getSessionUser();

    $id = $in->id;
    $updatedTitle = $in->remind_title;
    $updatedDueDate = (new DateTime())->format('Y-m-d H:i:s');

    try {
        $res = $db->query(
            <<<SQL
            UPDATE reminder
            SET
                re_title = "{$db->real_escape_string($updatedTitle)}",
                due_date = "{$db->real_escape_string($updatedDueDate)}"
            WHERE reminder_id = "{$db->real_escape_string(
                $id,
            )}";
            SQL
            ,
        );
    
        if ($res->num_rows <= 0) {
            return (new ResErr(
                ResErrCodes::REMINDER_NOT_FOUND,
                message: 'Attempted to edit a reminder that does not exist',
            ))->echo();
        }
    
        $row = $res->fetch_assoc();
    
        $reminder = new Reminder(
            id: $row['reminder_id'],
            re_title: $row['re_title'],
            re_datetime: $row['re_datetime'],
            re_isCompleted: $row['re_done'],
        );
    } catch (mysqli_sql_exception $err) {
        return (new ResErr(ResErrCodes::UNKNOWN, detail: $err))->echo();
    }
    
    return (new ResOk($reminders))->echo();
    


?>