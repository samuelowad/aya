import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationService } from './donation.service';
import { Donation } from './entities/donation.entity';

@Module({
  providers: [DonationService],
  imports: [TypeOrmModule.forFeature([Donation])],
  exports: [DonationService],
})
export class DonationModule {}
