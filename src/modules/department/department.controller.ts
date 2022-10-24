import { Controller, Get, Post } from '@nestjs/common';
import { uniqBy, forEach, orderBy } from 'lodash';
import { DepartmentService } from './department.service';
import { UserService } from '../user/user.service';
import { percentageDiff } from 'src/utils/percentage-diff.util';

@Controller('department')
export class DepartmentController {
  constructor(
    private readonly departmentService: DepartmentService,
    private readonly employeeService: UserService,
  ) {}

  @Post()
  async charitableDepartment(): Promise<string> {
    let query = `select SUM(amount) as sum,"userId",u."departmentId",d2.name 
     from donation d
      right join "user" u on u.id=d.id 
     right join "department" d2 on d2.id=u."departmentId" group by "userId",u."departmentId",d2.name order by  u."departmentId" asc ; 
    `;

    const results = await this.departmentService.queryBuilder(query);

    let departmentId = 0;
    let currentSumAmount = 0;
    const newResultArr = [];

    forEach(results, (result) => {
      if (result.departmentId === departmentId) {
        currentSumAmount += +result.sum;
        return;
      }
      newResultArr.push({
        departmentId: departmentId,
        amount: currentSumAmount,
        departmentName: result.name,
      });

      currentSumAmount = 0;
      departmentId = result.departmentId;
    });

    const [highest] = orderBy(newResultArr, ['amount'], ['desc']);

    query = `
    
     UPDATE "user" set balance= balance + 100 where "departmentId" = ${highest.departmentId};
     `;

    // this.employeeService.massUpdate(100, highest.departmentId);
    await this.departmentService.queryBuilder(query);

    return `employees in ${highest.departmentName} department have received $100 `;
  }

  @Get()
  async getDepartments() {
    // get sum by department

    let query = `
    select  SUM(s.amount)as sum ,u."departmentId",d."name" from salary s left join "user" u on u.id =s."userId" left join department d on d.id =u."departmentId" 
group by u."departmentId",d."name"  order by sum desc;
    
    `;
    const results = await this.departmentService.queryBuilder(query);

    const finalArray = [];

    for (const result of results) {
      query = ` 
        
        select amount ,"userId" ,date,u."name" ,u.surname,s.id  ,u."departmentId"  from salary s left join "user" u on u.id =s."userId" where u."departmentId" =${result.departmentId} group by u.id,s.id  order by s."userId" ,date asc ;
        
        `;
      let results2 = await this.departmentService.queryBuilder(query);
      results2 = uniqBy(results2, 'date');

      const arr = [];
      let obj1: any = {};
      let currentId = 0;
      let total = 0;
      forEach(results2, (result) => {
        if (currentId === result.userId) {
          total += +result.amount;
          obj1 = result;

          obj1.total = total;
          return;
        }

        arr.push(obj1);
        arr.push(result);
        total = +result.amount;

        currentId = result.userId;
      });
      arr.push(obj1);

      let obj2: any = {};
      let currentId2 = 0;
      let newArr = [];

      forEach(arr, (ar) => {
        if (currentId2 === ar.userId) {
          const def = percentageDiff(+obj2.amount, +ar.amount).toFixed(2);
          newArr.push({ ...ar, largest_increase_percent: `${def}%` });
          return;
        }
        currentId2 = ar.userId;

        obj2 = ar;
      });
      newArr = orderBy(newArr, ['total'], ['desc']).slice(0, 3);
      finalArray.push(newArr);
    }
    const res = {};
    results.forEach((result, index) => {
      res[result.name] = [];
      forEach(finalArray[index], (f) => {
        res[result.name].push({
          name: f.name,
          surname: f.surname,
          largest_increase_percent: f.largest_increase_percent,
          salary: {
            amount: +f.amount,
            date: f.date,
            id: f.id,
          },
        });
      });
    });
    return res;
  }
}
