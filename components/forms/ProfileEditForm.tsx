"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Upload,
  Save,
  X,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import ROUTES from "@/constants/routes";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  currentRole: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  github: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  skills: z.array(z.string()).optional().default([]),
  experience: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1, "Title is required"),
        company: z.string().min(1, "Company is required"),
        location: z.string().optional().or(z.literal("")),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().min(1, "End date is required"),
        description: z.string().optional().or(z.literal("")),
        current: z.boolean().optional().default(false),
      })
    )
    .optional()
    .default([]),
  education: z
    .array(
      z.object({
        id: z.string().optional(),
        degree: z.string().min(1, "Degree is required"),
        institution: z.string().min(1, "Institution is required"),
        location: z.string().optional().or(z.literal("")),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().min(1, "End date is required"),
        gpa: z.string().optional().or(z.literal("")),
      })
    )
    .optional()
    .default([]),
  projects: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Project name is required"),
        description: z.string().min(1, "Description is required"),
        technologies: z.array(z.string()).optional().default([]),
        link: z.string().optional().or(z.literal("")),
      })
    )
    .optional()
    .default([]),
  certifications: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Certification name is required"),
        issuer: z.string().min(1, "Issuer is required"),
        date: z.string().min(1, "Date is required"),
      })
    )
    .optional()
    .default([]),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  profile: any;
  userId: string;
}

export default function ProfileEditForm({
  profile,
  userId,
}: ProfileEditFormProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newTech, setNewTech] = useState<{ [key: number]: string }>({});

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      const result = await response.json();
      toast.success("Profile updated successfully");
      router.push(ROUTES.PROFILE(userId));
    } catch (error) {
      toast.error((error as Error).message || "Failed to update profile");
      console.error(error);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("FILE", file);

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to parse resume");
      }

      const parsedData = await response.json();

      // ✅ Convert null/undefined to empty strings
      form.reset({
        name: parsedData.name || "",
        email: parsedData.email || "",
        bio: parsedData.bio || "",
        location: parsedData.location || "",
        currentRole: parsedData.currentRole || "",
        company: parsedData.company || "",
        website: parsedData.website || "",
        github: parsedData.github || "",
        linkedin: parsedData.linkedin || "",
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        experience: Array.isArray(parsedData.experience)
          ? parsedData.experience.map((exp: any) => ({
              id: exp.id || Date.now().toString(),
              title: exp.title || "",
              company: exp.company || "",
              location: exp.location || "",
              startDate: exp.startDate || "",
              endDate: exp.endDate || "",
              description: exp.description || "",
              current: exp.current || false,
            }))
          : [],
        education: Array.isArray(parsedData.education)
          ? parsedData.education.map((edu: any) => ({
              id: edu.id || Date.now().toString(),
              degree: edu.degree || "",
              institution: edu.institution || "",
              location: edu.location || "",
              startDate: edu.startDate || "",
              endDate: edu.endDate || "",
              gpa: edu.gpa || "",
            }))
          : [],
        projects: Array.isArray(parsedData.projects)
          ? parsedData.projects.map((proj: any) => ({
              id: proj.id || Date.now().toString(),
              name: proj.name || "",
              description: proj.description || "",
              technologies: Array.isArray(proj.technologies)
                ? proj.technologies
                : [],
              link: proj.link || "",
            }))
          : [],
        certifications: Array.isArray(parsedData.certifications)
          ? parsedData.certifications.map((cert: any) => ({
              id: cert.id || Date.now().toString(),
              name: cert.name || "",
              issuer: cert.issuer || "",
              date: cert.date || "",
            }))
          : [],
      });

      toast.success("Resume parsed successfully! Form has been auto-filled.");
    } catch (error) {
      toast.error((error as Error).message || "Failed to parse resume");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = form.getValues("skills");
      form.setValue("skills", [...currentSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    const currentSkills = form.getValues("skills");
    form.setValue(
      "skills",
      currentSkills.filter((_, i) => i !== index)
    );
  };

  const addTechnology = (projectIndex: number) => {
    const tech = newTech[projectIndex];
    if (tech?.trim()) {
      const currentTechs = form.getValues(
        `projects.${projectIndex}.technologies`
      );
      form.setValue(`projects.${projectIndex}.technologies`, [
        ...currentTechs,
        tech.trim(),
      ]);
      setNewTech({ ...newTech, [projectIndex]: "" });
    }
  };

  const removeTechnology = (projectIndex: number, techIndex: number) => {
    const currentTechs = form.getValues(
      `projects.${projectIndex}.technologies`
    );
    form.setValue(
      `projects.${projectIndex}.technologies`,
      currentTechs.filter((_, i) => i !== techIndex)
    );
  };

  const handleSubmitClick = () => {
    console.log("Submit button clicked!");
    console.log("Form state:", {
      isDirty: form.formState.isDirty,
      isValid: form.formState.isValid,
      isSubmitting: form.formState.isSubmitting,
      errors: form.formState.errors,
    });

    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="space-y-8">
      <div className="bg-linear-to-br from-indigo-500 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">Upload Resume</h3>
            <p className="text-indigo-100">
              Auto-fill your profile by uploading your resume
            </p>
          </div>
          <Upload className="w-12 h-12 text-white/80" />
        </div>
        <label className="block">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border-2 border-dashed border-white/40 hover:border-white/60 transition-all cursor-pointer text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              disabled={isUploading}
              className="hidden"
            />
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">
              {isUploading ? "Parsing resume..." : "Click to upload resume"}
            </p>
            <p className="text-sm text-indigo-100 mt-1">PDF, DOC, DOCX</p>
          </div>
        </label>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-xl">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Tech Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourwebsite.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-3 rounded-xl">
                <Code className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Skills</h2>
            </div>

            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSkill())
                }
              />
              <Button type="button" onClick={addSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {form.watch("skills").map((skill, index) => (
                <span
                  key={index}
                  className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-slate-500 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Experience
                </h2>
              </div>
              <Button
                type="button"
                onClick={() =>
                  appendExperience({
                    id: Date.now().toString(),
                    title: "",
                    company: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                    current: false,
                  })
                }
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </div>

            <div className="space-y-6">
              {experienceFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-slate-200 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-900">
                      Experience #{index + 1}
                    </h3>
                    <Button
                      type="button"
                      onClick={() => removeExperience(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`experience.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Software Engineer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experience.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Tech Corp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experience.${index}.location`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="San Francisco, CA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experience.${index}.current`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 mt-8">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="mt-0!">
                            Current Position
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experience.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input placeholder="Jan 2022" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experience.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input placeholder="Present" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`experience.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your responsibilities..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Education</h2>
              </div>
              <Button
                type="button"
                onClick={() =>
                  appendEducation({
                    id: Date.now().toString(),
                    degree: "",
                    institution: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    gpa: "",
                  })
                }
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </div>

            <div className="space-y-6">
              {educationFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-slate-200 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-900">
                      Education #{index + 1}
                    </h3>
                    <Button
                      type="button"
                      onClick={() => removeEducation(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`education.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Degree</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Bachelor of Science"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Stanford University"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.location`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Stanford, CA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.gpa`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GPA</FormLabel>
                          <FormControl>
                            <Input placeholder="3.8/4.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Year</FormLabel>
                          <FormControl>
                            <Input placeholder="2014" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Year</FormLabel>
                          <FormControl>
                            <Input placeholder="2018" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Code className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
              </div>
              <Button
                type="button"
                onClick={() =>
                  appendProject({
                    id: Date.now().toString(),
                    name: "",
                    description: "",
                    technologies: [],
                    link: "",
                  })
                }
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>

            <div className="space-y-6">
              {projectFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-slate-200 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-900">
                      Project #{index + 1}
                    </h3>
                    <Button
                      type="button"
                      onClick={() => removeProject(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`projects.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="E-Commerce Platform"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`projects.${index}.link`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Link</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://github.com/..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`projects.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-4">
                    <FormLabel>Technologies</FormLabel>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Add technology"
                        value={newTech[index] || ""}
                        onChange={(e) =>
                          setNewTech({ ...newTech, [index]: e.target.value })
                        }
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addTechnology(index))
                        }
                      />
                      <Button
                        type="button"
                        onClick={() => addTechnology(index)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form
                        .watch(`projects.${index}.technologies`)
                        .map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => removeTechnology(index, techIndex)}
                              className="text-purple-500 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-xl">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Certifications
                </h2>
              </div>
              <Button
                type="button"
                onClick={() =>
                  appendCertification({
                    id: Date.now().toString(),
                    name: "",
                    issuer: "",
                    date: "",
                  })
                }
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            </div>

            <div className="space-y-6">
              {certificationFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-slate-200 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-900">
                      Certification #{index + 1}
                    </h3>
                    <Button
                      type="button"
                      onClick={() => removeCertification(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certification Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="AWS Solutions Architect"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`certifications.${index}.issuer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issuer</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Amazon Web Services"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`certifications.${index}.date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input placeholder="2023" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              onClick={handleSubmitClick}
              disabled={form.formState.isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {form.formState.isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(ROUTES.PROFILE(userId))}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
