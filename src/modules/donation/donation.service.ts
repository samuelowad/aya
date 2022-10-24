import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './entities/donation.entity';

@Injectable()
export class DonationService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
  ) {}

  create(donations: Partial<Donation[]>): void {
    this.donationRepository.insert(this.donationRepository.create(donations));
  }

  find(): Promise<Donation[]> {
    return this.donationRepository.find();
  }
}
