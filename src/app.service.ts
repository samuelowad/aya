import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { isEmpty, has, forEach } from 'lodash';
import { DepartmentService } from './modules/department/department.service';
import { startsWithCapital } from './utils/check-letter.util';
import { readText } from './utils/readline.util';
import { UserService } from './modules/user/user.service';
import { getKeyValue } from './utils/get-key-value.util';
import { SalaryService } from './modules/salary/salary.service';
import { getDate } from './utils/get-date.util';
import { DonationService } from './modules/donation/donation.service';
import { FileNameService } from './modules/file-name/file-name.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly departmentService: DepartmentService,

    // to be adjusted to proper naming
    private readonly employeeService: UserService,
    private readonly salaryService: SalaryService,
    private readonly donationService: DonationService,
    private readonly fileNameService: FileNameService,
  ) {}

  async onModuleInit() {
    const newDepService = this.departmentService;
    const newEmployeeService = this.employeeService;
    const newSalaryService = this.salaryService;
    const newDonationService = this.donationService;
    const newFileNameService = this.fileNameService;

    const newUpdateDonationAmount = this.updateDonationData;
    const isAfter = this.isAfter;

    let empData = {};
    let salaryDataArr = [];
    let salaryData = {};
    let departmentData = {};
    let donationData = {};
    const donationDataArr = [];
    let rateData = {};
    let rateDataArr = [];
    let capital = '';
    let empId = 0;

    // question 1, right now any file written just like it is in this document file is supported
    // question 3, file will be downloaded, saved and read and deleted after done
    const { read, filename } = readText('./src/assets/ts.txt');
    const file = await newFileNameService.findOne(filename);
    const { id } = file || {};
    if (id) {
      Logger.error('current file already uploaded');
      return;
    }
    Logger.log('updating DB');

    await read.on('line', async function (line) {
      if (line == '') return;

      if (startsWithCapital(line.trim()) && line.trim() !== capital) {
        if (line.search(/\S/) > 1) {
          capital = line.trim();

          read.pause();
          switch (line.trim()) {
            case 'Salary':
              const department = await newDepService.create(departmentData);
              const { id } = await newEmployeeService.create({
                ...empData,
                departmentId: department.id,
              });
              departmentData = {};
              empData = {};
              empId = id;
              break;

            case 'Donation':
              await newSalaryService.create(salaryDataArr);
              salaryDataArr = [];
              salaryData = {};
              break;

            case 'Employee':
              if (salaryDataArr.length) {
                await newSalaryService.create(salaryDataArr);
              }

              break;

            default:
              break;
          }

          read.resume();
        }
      }

      if (line.trim() === capital) {
        switch (capital) {
          case 'Statement':
            salaryData = {};
            return;
          case 'Donation':
            donationData = {};
            return;

          case 'Rate':
            rateData = {};
            return;
        }
      }

      line = line.trim();

      if (!startsWithCapital(line)) {
        switch (capital) {
          case 'Employee': {
            const [key, value] = getKeyValue(line, ':');
            empData[key] = value;

            return;
          }
          case 'Department': {
            const [key, value] = getKeyValue(line, ':');
            departmentData[key] = value;

            return;
          }

          case 'Statement': {
            if (!isEmpty(salaryData) && has(salaryData, 'amount')) {
              salaryDataArr.push(salaryData);
            }
            const [key, value] = getKeyValue(line, ':');

            salaryData[key] =
              key === 'amount'
                ? +value
                : key === 'date'
                ? getDate(value)
                : value;
            salaryData['userId'] = empId;
            return;
          }

          case 'Donation': {
            if (!isEmpty(donationData) && has(donationData, 'date')) {
              donationDataArr.push(donationData);
            }
            const [key, value] = getKeyValue(line, ':');
            if (key === 'amount') {
              const [amount, currency] = getKeyValue(value.trim(), ' ');
              donationData[key] = +amount;
              donationData['currency'] = currency;
              donationData['userId'] = empId;
              return;
            }
            donationData[key] = key === 'date' ? getDate(value) : value;
            donationData['userId'] = empId;

            return;
          }

          case 'Rate': {
            if (!isEmpty(rateData) && has(rateData, 'sign')) {
              rateDataArr.push(rateData);
            }
            const [key, value] = getKeyValue(line, ':');
            rateData[key] =
              key === 'value'
                ? +value
                : key === 'date'
                ? getDate(value)
                : value;
          }
          default:
            return;
        }
      }
    });

    await read.on('end', async () => {
      rateDataArr = rateDataArr.sort(function compare(a, b) {
        const dateA: any = new Date(a.date);
        const dateB: any = new Date(b.date);
        return dateA - dateB;
      });

      const updatedDonations = await newUpdateDonationAmount(
        donationDataArr,
        rateDataArr,
        isAfter,
        filename,
        newFileNameService,
      );

      await newDonationService.create(updatedDonations);
      Logger.log('done updating DB');
    });
  }

  private async updateDonationData(
    donations,
    rates,
    isAfter,
    filename: string,
    newFileNameService,
  ) {
    const updateDonation = [];
    await forEach(donations, async (donation) => {
      let currentRate = 1;

      // question two, if to get over api, a simple axios request  here and looping over it has it is now
      await forEach(rates, (rate) => {
        const newDonationDate = new Date(donation.date);
        const newRateDate = new Date(rate.date);

        if (
          isAfter(newDonationDate, newRateDate) &&
          donation.currency.trim() === rate.sign.trim()
        ) {
          currentRate = rate.value;
          donation.currency = 'USD';
        }
      });

      if (currentRate > 1) {
        donation.amount = donation.amount * currentRate;

        donation.currency = 'USD';
        donation['updated'] = true;
      }

      updateDonation.push(donation);
    });

    await newFileNameService.create(filename);

    return updateDonation;
  }

  private isAfter(date1: Date, date2: Date): boolean {
    return date1 >= date2;
  }
}
