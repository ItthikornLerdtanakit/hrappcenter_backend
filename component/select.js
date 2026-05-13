import db from './connectdatabase.js';
import jwt from 'jsonwebtoken';

export const login = async (item) => {
    const { email, oid } = item;
    const email_new = email.split('@')[0];
    const select = 'select * from employees inner join departments on employees.department_id = departments.department_id where employee_email like ? and employee_status != ?';
    const [result_select] = await db.connectdatabase.query(select, [`${email_new}%`, 'resign']);
    if (result_select.length === 1) {
        if (result_select[0].employee_oid === null || result_select[0].employee_oid === '') {
            result_select[0].employee_oid = oid;
            const update = 'update employees set employee_oid = ? where employee_id = ?';
            const [result_update] = db.connectdatabase.query(update, [oid, result_select[0].employee_id]);
            if (result_update.affectedRows > 0) {
                const token = jwt.sign({ result_select: result_select }, process.env.SECRET_KEY, { expiresIn: '1h' });
                return { login: 'success', token };
            } else {
                return { login: 'failed' };
            }
        } else {
            const token = jwt.sign({ result_select: result_select }, process.env.SECRET_KEY, { expiresIn: '1h' });
            return { login: 'success', token };
        }
    } else {
        return { login: 'user_not_exist' };
    }
}

export const get_application = async (item) => {
    const { emp_id, emp_usertype } = item;
    let select = '';
    if (emp_usertype === 'admin') {
        select = 'select * from applications';
    } else {
        select = 'select * from applications a inner join groups g on a.group_id = g.group_id inner join grouplists gl on g.group_id = gl.group_id where employee_id = ?';
    }
    const [result] = await db.connectdatabase.query(select, [emp_id]);
    return result;
}