import { supabase } from "../supabase-client.js";
import "../cards/large-card.js";

class ServiceDescriptionEditor extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.innerHTML = `<large-card class="service-description-editor"><h2 class="heading">Service Description</h2><form><textarea class="medium-input" name="description" rows="3" maxlength="2000" placeholder="Service Description"></textarea><button class="medium-button" type="submit" disabled>Save</button><p role="status" aria-live="polite"></p></form></large-card>`;
    this.form=this.querySelector("form"); this.field=this.form.elements.description;
    this.button=this.form.querySelector("button"); this.message=this.form.querySelector("[role=status]");
    this.form.addEventListener("submit",event=>this.save(event)); this.load();
  }
  async load() {
    try {
      const {data,error}=await supabase.from("service_content").select("description").eq("id",1).maybeSingle();
      if(error) throw error;
      this.field.value=data?.description||""; this.button.disabled=false;
    } catch(error) { this.message.textContent=error?.message||"Service description could not be loaded."; }
  }
  async save(event) {
    event.preventDefault(); this.button.disabled=true; this.message.textContent="";
    try {
      const {data:{user},error:authError}=await supabase.auth.getUser();
      if(authError) throw authError; if(!user) throw new Error("Please sign in again.");
      const {error}=await supabase.from("service_content").upsert({id:1,description:this.field.value.trim(),updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:"id"});
      if(error) throw error;
      this.message.textContent="Service description saved.";
      window.dispatchEvent(new CustomEvent("service-description-updated",{detail:{description:this.field.value.trim()}}));
    } catch(error) { this.message.textContent=error?.message||"Service description could not be saved."; }
    finally { this.button.disabled=false; }
  }
}
if(!customElements.get("service-description-editor")) customElements.define("service-description-editor",ServiceDescriptionEditor);
