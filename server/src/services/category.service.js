import { Category } from '../models/Category.js';

const DEFAULT_CATEGORIES = [
  {
    name: 'Home & Appliance Repair',
    slug: 'home-appliance-repair',
    description: 'Electricians, fan repairs, AC service, plumbing, and home appliance maintenance.',
    icon: 'Wrench',
    type: 'service',
  },
  {
    name: 'Books & Study Materials',
    slug: 'books-study-materials',
    description: 'Textbooks, university syllabus books, engineering guides, and study resources.',
    icon: 'BookOpen',
    type: 'both',
  },
  {
    name: 'Handwritten Notes & Exam Prep',
    slug: 'handwritten-notes-exam-prep',
    description: 'Semester lecture notes, previous year question papers, and revision summaries.',
    icon: 'FileText',
    type: 'resource',
  },
  {
    name: 'Electronics & Gadgets',
    slug: 'electronics-gadgets',
    description: 'Laptop fixing, mobile repairs, calculator/tool lending, and tech troubleshooting.',
    icon: 'Laptop',
    type: 'both',
  },
  {
    name: 'Academic Tutoring & Skills',
    slug: 'academic-tutoring-skills',
    description: 'Coding help, mathematics tuition, language training, and subject mentorship.',
    icon: 'GraduationCap',
    type: 'service',
  },
  {
    name: 'Tools & Lab Equipment',
    slug: 'tools-lab-equipment',
    description: 'Measurement tools, soldering kits, drawing boards, and lab accessories.',
    icon: 'Briefcase',
    type: 'both',
  },
  {
    name: 'General Assistance & Community Help',
    slug: 'general-community-help',
    description: 'Peer assistance, localized help, moving assistance, and urgent neighborly support.',
    icon: 'HeartHandshake',
    type: 'both',
  },
];

export class CategoryService {
  static async seedCategories() {
    try {
      for (const cat of DEFAULT_CATEGORIES) {
        const existing = await Category.findOne({ slug: cat.slug });
        if (!existing) {
          await Category.create(cat);
        }
      }
      console.log('[Category Seed] Default categories checked/seeded.');
    } catch (err) {
      console.error('[Category Seed Error]:', err.message);
    }
  }

  static async getAll(filter = {}) {
    return Category.find({ isActive: true, ...filter }).sort({ name: 1 });
  }

  static async getById(id) {
    return Category.findById(id);
  }

  static async create(data) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return Category.create({ ...data, slug });
  }

  static async update(id, data) {
    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    return Category.findByIdAndUpdate(id, data, { new: true });
  }
}
