import { Input } from '@/components/ui/input';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { RadioField } from './RadioField';
import { LocationCapture } from './LocationCapture';
import { SectionHeader } from './SectionHeader';
import { SurveyCommon, ShopType, BillsPerDay, BillingHandler } from '@/types/survey';
import { Store, User, Phone, MapPin } from 'lucide-react';

interface CommonInfoSectionProps {
  data: SurveyCommon;
  onChange: (data: Partial<SurveyCommon>) => void;
  errors?: Record<string, string>;
}

const shopTypeOptions = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'textiles', label: 'Textiles' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'other', label: 'Other' },
];

const billsPerDayOptions = [
  { value: '<50', label: 'Less than 50' },
  { value: '50-150', label: '50 - 150' },
  { value: '150-300', label: '150 - 300' },
  { value: '300+', label: 'More than 300' },
];

const billingHandlerOptions = [
  { value: 'owner', label: 'Owner' },
  { value: 'staff', label: 'Staff' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'mixed', label: 'Mixed' },
];

export function CommonInfoSection({ data, onChange, errors }: CommonInfoSectionProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader 
        title="Shop Information" 
        subtitle="Basic details about the shop"
        icon={Store}
      />

      <FormField label="Shop Name" required error={errors?.shopName}>
        <Input
          value={data.shopName}
          onChange={(e) => onChange({ shopName: e.target.value })}
          placeholder="Enter shop name"
        />
      </FormField>

      <FormField label="Owner Name / Contact Person">
        <Input
          value={data.ownerName || ''}
          onChange={(e) => onChange({ ownerName: e.target.value })}
          placeholder="Enter owner or contact name"
        />
      </FormField>

      <FormField label="Phone Number">
        <Input
          type="tel"
          value={data.phoneNumber || ''}
          onChange={(e) => onChange({ phoneNumber: e.target.value })}
          placeholder="Enter phone number"
        />
      </FormField>

      <SelectField
        label="Shop Type"
        value={data.shopType}
        onChange={(value) => onChange({ shopType: value as ShopType })}
        options={shopTypeOptions}
        required
        error={errors?.shopType}
      />

      <SelectField
        label="Approx. Number of Bills Per Day"
        value={data.billsPerDay}
        onChange={(value) => onChange({ billsPerDay: value as BillsPerDay })}
        options={billsPerDayOptions}
        required
        error={errors?.billsPerDay}
      />

      <RadioField
        label="Who Primarily Handles Billing?"
        value={data.billingHandler}
        onChange={(value) => onChange({ billingHandler: value as BillingHandler })}
        options={billingHandlerOptions}
        required
        error={errors?.billingHandler}
      />

      <LocationCapture
        location={data.location}
        onCapture={(location) => onChange({ location })}
      />

      <FormField label="Surveyor Name" required error={errors?.surveyorName}>
        <Input
          value={data.surveyorName}
          onChange={(e) => onChange({ surveyorName: e.target.value })}
          placeholder="Enter your name"
        />
      </FormField>
    </div>
  );
}
